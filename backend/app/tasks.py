"""
Celery Tasks for Background Processing
"""
from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, subject, template_name, context, recipient_list, from_email=None):
    """
    Send email using Celery task for background processing
    
    Args:
        subject: Email subject
        template_name: HTML template path
        context: Template context data
        recipient_list: List of recipient emails
        from_email: Sender email (optional)
    
    Returns:
        dict: Success/failure status with message
    """
    try:
        if from_email is None:
            from_email = settings.EMAIL_HOST_USER
        
        # Render HTML content
        html_content = render_to_string(template_name, context)
        
        # Create and send email
        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=from_email,
            to=recipient_list,
        )
        email.content_subtype = "html"
        email.send()
        
        logger.info(f"Email sent successfully to {recipient_list} | Subject: {subject}")
        return {
            'success': True,
            'message': f'Email sent to {len(recipient_list)} recipients',
            'recipients': recipient_list
        }
        
    except Exception as exc:
        logger.error(f"Email sending failed: {str(exc)} | Recipients: {recipient_list}")
        
        # Retry the task
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for email task | Recipients: {recipient_list}")
            return {
                'success': False,
                'message': f'Failed to send email after {self.max_retries} retries',
                'error': str(exc)
            }

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_blog_review_email_task(self, blog_id, action="created"):
    """
    Send blog review email to admin for review
    
    Args:
        blog_id: Blog ID to review
        action: Action performed (created, updated)
    
    Returns:
        dict: Task execution result
    """
    try:
        from .models import Blog
        
        blog = Blog.objects.select_related('user').get(id=blog_id)
        
        # Email configuration
        review_email = "imranansari.in.official@gmail.com"
        subject = f"Blog Review Required - {blog.title} ({action.title()})"
        template_name = "blog_review.html"
        
        context = {
            "blog_title": blog.title,
            "blog_description": blog.description,
            "author_name": blog.user.name,
            "author_email": blog.user.email,
            "action": action,
            "blog_id": blog.id,
            "created_at": blog.created_at,
            "updated_at": blog.updated_at,
        }
        
        # Send email using email task
        result = send_email_task.delay(
            subject=subject,
            template_name=template_name,
            context=context,
            recipient_list=[review_email]
        )
        
        logger.info(f"Blog review email task queued | Blog ID: {blog_id} | Action: {action}")
        return {
            'success': True,
            'message': 'Blog review email task queued successfully',
            'task_id': result.id
        }
        
    except Exception as exc:
        logger.error(f"Blog review email task failed: {str(exc)} | Blog ID: {blog_id}")
        
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for blog review email | Blog ID: {blog_id}")
            return {
                'success': False,
                'message': f'Failed to queue blog review email after {self.max_retries} retries',
                'error': str(exc)
            }

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_user_blog_confirmation_email_task(self, blog_id, action="created"):
    """
    Send confirmation email to user about blog submission
    
    Args:
        blog_id: Blog ID
        action: Action performed (created, updated)
    
    Returns:
        dict: Task execution result
    """
    try:
        from .models import Blog
        
        blog = Blog.objects.select_related('user').get(id=blog_id)
        user = blog.user
        
        subject = f"Your Blog Post is Under Review - {blog.title}"
        template_name = "user_blog_confirmation.html"
        
        context = {
            "user_name": user.name,
            "blog_title": blog.title,
            "blog_description": blog.description[:300] + "..." if len(blog.description) > 300 else blog.description,
            "action": action,
            "blog_id": blog.id,
            "created_at": blog.created_at,
            "updated_at": blog.updated_at,
            "status_display": blog.get_status_display(),
        }
        
        # Send email using email task
        result = send_email_task.delay(
            subject=subject,
            template_name=template_name,
            context=context,
            recipient_list=[user.email]
        )
        
        logger.info(f"User confirmation email task queued | Blog ID: {blog_id} | User: {user.email}")
        return {
            'success': True,
            'message': 'User confirmation email task queued successfully',
            'task_id': result.id
        }
        
    except Exception as exc:
        logger.error(f"User confirmation email task failed: {str(exc)} | Blog ID: {blog_id}")
        
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for user confirmation email | Blog ID: {blog_id}")
            return {
                'success': False,
                'message': f'Failed to queue user confirmation email after {self.max_retries} retries',
                'error': str(exc)
            }

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_blog_status_update_email_task(self, blog_id, old_status, new_status, admin_user_id=None):
    """
    Send blog status update email to user
    
    Args:
        blog_id: Blog ID
        old_status: Previous status
        new_status: New status
        admin_user_id: Admin user ID who made the change
    
    Returns:
        dict: Task execution result
    """
    try:
        from .models import Blog, User
        
        blog = Blog.objects.select_related('user').get(id=blog_id)
        user = blog.user
        
        # Only send email for meaningful status changes (to published and rejected)
        if new_status not in [2, 4]:  # BlogStatus.PUBLISHED, REJECTED
            return {
                'success': True,
                'message': 'No email needed for this status change'
            }
        
        # Get admin user if provided
        admin_user = None
        if admin_user_id:
            try:
                admin_user = User.objects.get(id=admin_user_id)
            except User.DoesNotExist:
                pass
        
        # Generate blog URL
        author_name_url = user.name.replace(" ", "-")
        blog_title_url = blog.title.replace(" ", "-").replace("?", "").replace("!", "").replace(",", "").replace(".", "")
        blog_url = f"https://blog.imranansari.in/{author_name_url}/posts/{blog_title_url}-{blog.id}"
        
        # Configure email based on status
        if new_status == 2:  # PUBLISHED
            subject = f"🎉 Your Blog Post has been Published - {blog.title}"
        elif new_status == 4:  # REJECTED
            subject = f"❌ Your Blog Post Review Update - {blog.title}"
        else:
            return {'success': True, 'message': 'No email needed for this status change'}
        
        template_name = "blog_status_update.html"
        
        context = {
            "user_name": user.name,
            "blog_title": blog.title,
            "blog_url": blog_url,
            "blog_id": blog.id,
            "old_status": dict(blog._meta.get_field('status').choices).get(old_status, old_status),
            "new_status": dict(blog._meta.get_field('status').choices).get(new_status, new_status),
            "new_status_value": new_status,
            "updated_at": blog.updated_at,
            "admin_user": admin_user.get_full_name() if admin_user else "Admin",
        }
        
        # Send email using email task
        result = send_email_task.delay(
            subject=subject,
            template_name=template_name,
            context=context,
            recipient_list=[user.email]
        )
        
        logger.info(f"Blog status update email task queued | Blog ID: {blog_id} | Status: {old_status} -> {new_status}")
        return {
            'success': True,
            'message': 'Blog status update email task queued successfully',
            'task_id': result.id
        }
        
    except Exception as exc:
        logger.error(f"Blog status update email task failed: {str(exc)} | Blog ID: {blog_id}")
        
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for blog status update email | Blog ID: {blog_id}")
            return {
                'success': False,
                'message': f'Failed to queue blog status update email after {self.max_retries} retries',
                'error': str(exc)
            }

@shared_task(bind=True, max_retries=3, default_retry_delay=60) 
def send_otp_email_task(self, user_id, otp):
    """
    Send OTP email to user for verification
    
    Args:
        user_id: User ID
        otp: OTP code
    
    Returns:
        dict: Task execution result
    """
    try:
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        subject = "Your OTP for Account Verification"
        template_name = "send_otp.html"
        
        context = {
            "otp": otp,
            "name": user.name
        }
        
        # Send email using email task
        result = send_email_task.delay(
            subject=subject,
            template_name=template_name,
            context=context,
            recipient_list=[user.email]
        )
        
        logger.info(f"OTP email task queued | User: {user.email}")
        return {
            'success': True,
            'message': 'OTP email task queued successfully',
            'task_id': result.id
        }
        
    except Exception as exc:
        logger.error(f"OTP email task failed: {str(exc)} | User ID: {user_id}")
        
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for OTP email | User ID: {user_id}")
            return {
                'success': False,
                'message': f'Failed to queue OTP email after {self.max_retries} retries',
                'error': str(exc)
            }

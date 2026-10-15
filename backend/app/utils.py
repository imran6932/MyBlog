import random, logging
from datetime import timedelta
from django.utils import timezone
from .models import OTPVerify
from django.contrib.auth import get_user_model

User = get_user_model()


def verify_otp(user, otp):
    otp_obj = OTPVerify.objects.get(user=user)
    now = timezone.now()
    # print("now-", now)
    # print("expiry", otp_obj.expiry)

    if int(otp) == int(otp_obj.otp) and otp_obj.expiry > now:
        user_ = User.objects.get(id=user.id)
        user_.is_verified = True
        user_.save()
        # print("verified")
        return True


def email_otp(user, otp):
    """Send Email OTP using Celery task"""
    try:
        from .tasks import send_otp_email_task
        
        # Queue the email task
        task = send_otp_email_task.delay(user.id, otp)
        
        logging.info(f"OTP email task queued | User: {user.email} | Task ID: {task.id}")
        return True, "done"
        
    except Exception as e:
        logging.error(f"OTP email task queue failed - {str(e)} | User: {user}")
        return False, str(e)


def generate_otp(user):

    try:

        otp = random.randint(101010, 999999)
        expiry = timezone.now() + timedelta(minutes=5)

        email, msg = email_otp(user, otp)
        if email:
            defaults = {"otp": otp, "expiry": expiry, "is_emailed": True}
            OTPVerify.objects.update_or_create(user=user, defaults=defaults)
            return True, "done"
        return False, msg

    except Exception as e:
        logging.error(
            f"Exception on generate token | User {user} | Exception- {str(e)}\n"
        )
        return False, e


def send_blog_review_email(blog, action="created"):
    """Send email notification for blog review using Celery"""
    try:
        from .tasks import send_blog_review_email_task
        
        # Queue the email task
        task = send_blog_review_email_task.delay(blog.id, action)
        
        logging.info(f"Blog review email task queued | Blog ID: {blog.id} | Action: {action} | Task ID: {task.id}")
        return True, "Blog review email task queued successfully"
        
    except Exception as e:
        logging.error(f"Blog review email task queue failed - {str(e)} | Blog ID: {blog.id}")
        return False, str(e)


def send_user_blog_confirmation_email(blog, action="created"):
    """Send confirmation email to user about blog submission using Celery"""
    try:
        from .tasks import send_user_blog_confirmation_email_task
        
        # Queue the email task
        task = send_user_blog_confirmation_email_task.delay(blog.id, action)
        
        logging.info(f"User confirmation email task queued | Blog ID: {blog.id} | User: {blog.user.email} | Task ID: {task.id}")
        return True, "User confirmation email task queued successfully"
        
    except Exception as e:
        logging.error(f"User confirmation email task queue failed - {str(e)} | Blog ID: {blog.id}")
        return False, str(e)


def send_blog_status_update_email(blog, old_status, new_status, admin_user=None):
    """Send email notification to user when blog status is updated using Celery"""
    try:
        from .tasks import send_blog_status_update_email_task
        
        # Queue the email task
        admin_user_id = admin_user.id if admin_user else None
        task = send_blog_status_update_email_task.delay(blog.id, old_status, new_status, admin_user_id)
        
        logging.info(f"Blog status update email task queued | Blog ID: {blog.id} | Status: {old_status} -> {new_status} | Task ID: {task.id}")
        return True, "Blog status update email task queued successfully"
        
    except Exception as e:
        logging.error(f"Blog status update email task queue failed - {str(e)} | Blog ID: {blog.id}")
        return False, str(e)

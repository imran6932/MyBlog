from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib import messages
import logging
from .models import Blog, User, OTPVerify, SamplePhoto, BlogStatus, Comment, Like
from .utils import send_blog_status_update_email


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "name",
        "id",
        "is_superuser",
        "is_staff",
        "is_active",
        "is_verified",
        "photo_thumbnail",
        "created_at",
        "updated_at",
        "date_joined",
        "blog_count",
    ]
    
    list_filter = [
        "is_superuser",
        "is_staff", 
        "is_active",
        "is_verified",
        "date_joined",
        "created_at",
        "updated_at",
    ]
    
    search_fields = [
        "email",
        "name",
        "id",
    ]
    
    readonly_fields = [
        "date_joined",
        "last_login",
        "created_at",
        "updated_at",
        "photo_preview",
        "blog_count",
    ]
    
    fieldsets = (
        ("Personal Information", {
            "fields": ("name", "email", "photo", "photo_preview")
        }),
        ("Permissions", {
            "fields": ("is_active", "is_verified", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Important Dates", {
            "fields": ("date_joined", "last_login", "created_at", "updated_at")
        }),
        ("Statistics", {
            "fields": ("blog_count",)
        }),
    )
    
    ordering = ["-date_joined"]
    list_per_page = 25
    
    def photo_thumbnail(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" />',
                obj.photo.url
            )
        return "No Photo"
    photo_thumbnail.short_description = "Photo"
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width: 150px; height: 150px; border-radius: 10px; object-fit: cover;" />',
                obj.photo.url
            )
        return "No Photo"
    photo_preview.short_description = "Photo Preview"
    
    def blog_count(self, obj):
        count = obj.blog_set.count()
        if count > 0:
            url = reverse("admin:app_blog_changelist") + f"?user__id__exact={obj.id}"
            return format_html('<a href="{}">{} blogs</a>', url, count)
        return "0 blogs"
    blog_count.short_description = "Blogs"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "blog", "truncated_content", "parent_id", "created_at", "updated_at")
    list_filter = ("created_at", "updated_at", "user", "blog")
    search_fields = ("content", "user__email", "blog__title")
    ordering = ["-created_at"]

    def truncated_content(self, obj):
        max_length = 50
        if len(obj.content) > max_length:
            return obj.content[:max_length] + "..."
        return obj.content
    truncated_content.short_description = "Content"


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("blog", "user_count", "updated_at")
    list_filter = ("created_at", "blog", "updated_at")
    search_fields = ("blog__title", "blog__id", "user__email")
    ordering = ["-created_at"]

    def user_count(self, obj):
        return obj.user.count()
    user_count.short_description = "User Count"


@admin.register(OTPVerify)
class OTPVerifyAdmin(admin.ModelAdmin):
    list_display = [
        "user_email",
        "user_name", 
        "otp",
        "expiry",
        "is_emailed",
        "is_expired",
        "created_at",
        "updated_at",
    ]
    
    list_filter = [
        "is_emailed",
        "expiry",
        "created_at",
        "updated_at",
    ]
    
    search_fields = [
        "user__email",
        "user__name",
        "otp",
    ]
    
    readonly_fields = [
        "created_at",
        "updated_at",
        "is_expired",
    ]
    
    ordering = ["-updated_at"]
    list_per_page = 25
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"
    user_email.admin_order_field = "user__email"
    
    def user_name(self, obj):
        return obj.user.name
    user_name.short_description = "User Name"
    user_name.admin_order_field = "user__name"
    
    def is_expired(self, obj):
        from django.utils import timezone
        is_exp = timezone.now() > obj.expiry
        if is_exp:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    is_expired.short_description = "Status"


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "user_email",
        "user_name",
        "status_badge",
        "photo_thumbnail",
        "created_at",
        "updated_at",
        "id",
        "description_preview",
    ]
    
    list_filter = [
        "status",
        "created_at",
        "updated_at",
        "user__is_verified",
        ("user", admin.RelatedOnlyFieldListFilter),
    ]
    
    search_fields = [
        "title",
        "user__email",
        "user__name",
        "description",
        "id",
    ]
    
    readonly_fields = [
        "created_at",
        "updated_at",
        "photo_preview",
        "description_preview_full",
        "user_link",
    ]
    
    fieldsets = (
        ("Blog Information", {
            "fields": ("title", "description", "description_preview_full")
        }),
        ("Media", {
            "fields": ("photo", "photo_preview")
        }),
        ("Settings", {
            "fields": ("user", "user_link", "status")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
    
    ordering = ["-created_at"]
    list_per_page = 20
    date_hierarchy = "created_at"
    
    actions = ["mark_as_published", "mark_as_inactive", "mark_as_archived", "mark_as_rejected"]
    
    def save_model(self, request, obj, form, change):
        """Override save_model to send email notifications on status changes"""
        old_status = None
        
        if change:  # Only for existing objects being updated
            try:
                # Get the original object from database to compare status
                original_obj = Blog.objects.get(pk=obj.pk)
                old_status = original_obj.status
            except Blog.DoesNotExist:
                old_status = None
        
        # Save the object first
        super().save_model(request, obj, form, change)
        
        # Send email notification if status changed from pending to published
        if old_status is not None and old_status != obj.status:
            try:
                # Send email for any meaningful status change
                email_sent, email_msg = send_blog_status_update_email(
                    obj, old_status, obj.status, request.user
                )
                
                if email_sent:
                    if old_status == BlogStatus.PENDING and obj.status == BlogStatus.PUBLISHED:
                        messages.success(request, f"Blog status updated and user notified! Email sent to {obj.user.email}")
                    else:
                        messages.info(request, f"Blog status updated and user notified via email.")
                else:
                    messages.warning(request, f"Blog status updated but email notification failed: {email_msg}")
                    
            except Exception as e:
                logging.error(f"Admin save_model email exception: {str(e)} | Blog ID: {obj.id}")
                messages.error(request, f"Blog status updated but email notification failed: {str(e)}")
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Author Email"
    user_email.admin_order_field = "user__email"
    
    def user_name(self, obj):
        return obj.user.name
    user_name.short_description = "Author Name"
    user_name.admin_order_field = "user__name"
    
    def status_badge(self, obj):
        colors = {
            BlogStatus.PENDING: "#ffc107",  # Yellow
            BlogStatus.PUBLISHED: "#28a745",  # Green
            BlogStatus.ARCHIVED: "#6c757d",  # Gray
            BlogStatus.REJECTED: "#dc3545",  # Red
        }
        color = colors.get(obj.status, "#6c757d")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"
    
    def photo_thumbnail(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;" />',
                obj.photo.url
            )
        return "No Photo"
    photo_thumbnail.short_description = "Photo"
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px; border-radius: 10px; object-fit: cover;" />',
                obj.photo.url
            )
        return "No Photo"
    photo_preview.short_description = "Photo Preview"
    
    def description_preview(self, obj):
        from django.utils.html import strip_tags
        text = strip_tags(obj.description)
        return text[:50] + "..." if len(text) > 50 else text
    description_preview.short_description = "Content Preview"
    
    def description_preview_full(self, obj):
        return mark_safe(obj.description)
    description_preview_full.short_description = "Full Content Preview"
    
    def user_link(self, obj):
        url = reverse("admin:app_user_change", args=[obj.user.id])
        return format_html('<a href="{}">{} ({})</a>', url, obj.user.name, obj.user.email)
    user_link.short_description = "Author"
    
    # Custom Actions
    def mark_as_published(self, request, queryset):
        """Mark selected blogs as published and send email notifications"""
        updated_count = 0
        email_sent_count = 0
        
        for blog in queryset:
            old_status = blog.status
            blog.status = BlogStatus.PUBLISHED
            blog.save()
            updated_count += 1
            
            # Send email notification
            try:
                email_sent, email_msg = send_blog_status_update_email(
                    blog, old_status, BlogStatus.PUBLISHED, request.user
                )
                if email_sent:
                    email_sent_count += 1
            except Exception as e:
                logging.error(f"Admin action email exception: {str(e)} | Blog ID: {blog.id}")
        
        self.message_user(
            request, 
            f"{updated_count} blogs marked as published. {email_sent_count} email notifications sent."
        )
    mark_as_published.short_description = "Mark selected blogs as published (with email notification)"

    def mark_as_pending(self, request, queryset):
        """Mark selected blogs as pending"""
        updated = queryset.update(status=BlogStatus.PENDING)
        self.message_user(request, f"{updated} blogs marked as pending.")
    mark_as_pending.short_description = "Mark selected blogs as pending"

    def mark_as_archived(self, request, queryset):
        """Mark selected blogs as archived and send email notifications"""
        updated_count = 0
        email_sent_count = 0
        
        for blog in queryset:
            old_status = blog.status
            blog.status = BlogStatus.ARCHIVED
            blog.save()
            updated_count += 1
            
            # Send email notification
            try:
                email_sent, email_msg = send_blog_status_update_email(
                    blog, old_status, BlogStatus.ARCHIVED, request.user
                )
                if email_sent:
                    email_sent_count += 1
            except Exception as e:
                logging.error(f"Admin action email exception: {str(e)} | Blog ID: {blog.id}")
        
        self.message_user(
            request, 
            f"{updated_count} blogs marked as archived. {email_sent_count} email notifications sent."
        )
    mark_as_archived.short_description = "Mark selected blogs as archived (with email notification)"
    
    def mark_as_rejected(self, request, queryset):
        """Mark selected blogs as rejected and send email notifications"""
        updated_count = 0
        email_sent_count = 0
        
        for blog in queryset:
            old_status = blog.status
            blog.status = BlogStatus.REJECTED
            blog.save()
            updated_count += 1
            
            # Send email notification
            try:
                email_sent, email_msg = send_blog_status_update_email(
                    blog, old_status, BlogStatus.REJECTED, request.user
                )
                if email_sent:
                    email_sent_count += 1
            except Exception as e:
                logging.error(f"Admin action email exception: {str(e)} | Blog ID: {blog.id}")
        
        self.message_user(
            request, 
            f"{updated_count} blogs marked as rejected. {email_sent_count} email notifications sent."
        )
    mark_as_rejected.short_description = "Mark selected blogs as rejected (with email notification)"


@admin.register(SamplePhoto)
class SamplePhotoAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "blog_photo_thumbnail",
        "profile_photo_thumbnail",
        "blog_photo_name",
        "profile_photo_name",
    ]
    
    readonly_fields = [
        "blog_photo_preview",
        "profile_photo_preview",
    ]
    
    fieldsets = (
        ("Blog Photo", {
            "fields": ("blog_photo", "blog_photo_preview")
        }),
        ("Profile Photo", {
            "fields": ("profile_photo", "profile_photo_preview")
        }),
    )
    
    def blog_photo_thumbnail(self, obj):
        if obj.blog_photo:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;" />',
                obj.blog_photo.url
            )
        return "No Photo"
    blog_photo_thumbnail.short_description = "Blog Photo"
    
    def profile_photo_thumbnail(self, obj):
        if obj.profile_photo:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />',
                obj.profile_photo.url
            )
        return "No Photo"
    profile_photo_thumbnail.short_description = "Profile Photo"
    
    def blog_photo_preview(self, obj):
        if obj.blog_photo:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px; border-radius: 10px; object-fit: cover;" />',
                obj.blog_photo.url
            )
        return "No Photo"
    blog_photo_preview.short_description = "Blog Photo Preview"
    
    def profile_photo_preview(self, obj):
        if obj.profile_photo:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 50%; object-fit: cover;" />',
                obj.profile_photo.url
            )
        return "No Photo"
    profile_photo_preview.short_description = "Profile Photo Preview"
    
    def blog_photo_name(self, obj):
        return obj.blog_photo.name.split('/')[-1] if obj.blog_photo else "No file"
    blog_photo_name.short_description = "Blog File Name"
    
    def profile_photo_name(self, obj):
        return obj.profile_photo.name.split('/')[-1] if obj.profile_photo else "No file"
    profile_photo_name.short_description = "Profile File Name"

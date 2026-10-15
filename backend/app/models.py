from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from tinymce.models import HTMLField
from django.utils.translation import gettext_lazy as _


def get_blog_photo_path(instance, filename):
    return f"blogs_photo/{instance.user.id}_{instance.user.name.replace(' ', '_')}/{filename}"


def get_profile_photo_path(instance, filename):
    return f"profile_photo/{instance.id}_{instance.name.replace(' ', '_')}/{filename}"


def get_sample_photo_path(instance, filename):
    return f"sample_photo/{filename}"


class UserManager(BaseUserManager):
    """Custom User manager"""

    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(("The email must be set"))

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(("Superuser must have is_staff=True."))

        if extra_fields.get("is_superuser") is not True:
            raise ValueError(("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model"""

    username = None
    first_name = None
    last_name = None

    name = models.CharField(max_length=50, db_index=True)  # Add index for search performance
    email = models.EmailField(max_length=50, unique=True)
    is_verified = models.BooleanField(default=False, db_index=True)  # Add index for filtering
    photo = models.ImageField(upload_to=get_profile_photo_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return str(self.email)


class OTPVerify(models.Model):
    """OTP verification"""

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    expiry = models.DateTimeField()
    is_emailed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return str(self.user)


class SamplePhoto(models.Model):
    blog_photo = models.ImageField(upload_to=get_sample_photo_path)
    profile_photo = models.ImageField(upload_to=get_sample_photo_path)

    def __str__(self):
        return str(self.id)


class BlogStatus(models.IntegerChoices):
    PENDING = 1, _("Pending")
    PUBLISHED = 2, _("Published")
    ARCHIVED = 3, _("Archived")
    REJECTED = 4, _("Rejected")


class Blog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = HTMLField()
    photo = models.ImageField(upload_to=get_blog_photo_path, blank=True, null=True)
    status = models.PositiveSmallIntegerField(
        choices=BlogStatus.choices, default=BlogStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["title"]),
            models.Index(fields=["status"]),
            models.Index(fields=["user", "status"]),  # Most common query combination
            models.Index(fields=["status", "created_at"]),  # Public blog listing optimization
        ]
        unique_together = ("user", "title")

    def __str__(self):
        return self.user.email


class Comment(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comment_users"
    )
    blog = models.ForeignKey(
        Blog, on_delete=models.CASCADE, related_name="comment_blogs"
    )
    content = models.TextField()
    parent_id = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="comment_replies"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["blog"]),
            models.Index(fields=["parent_id"]),
            models.Index(fields=["blog", "parent_id"]),  # Composite index for comment hierarchy queries
        ]

    def __str__(self):
        return f"Comment by {self.user.email} on {self.blog.title}"


class Like(models.Model):
    user = models.ManyToManyField(User, related_name="like_users")
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name="like_blogs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["blog"]),
        ]

    def __str__(self):
        return f"{self.user.email} liked {self.blog.title}"

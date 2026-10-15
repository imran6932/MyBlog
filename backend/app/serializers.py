from rest_framework import serializers
from django.contrib.auth import get_user_model
from .utils import generate_otp
from .models import Blog, SamplePhoto, User, Comment
from django.db import models
from django.core.cache import cache

User = get_user_model()

# Cache for default photos to avoid repeated DB queries
def get_cached_default_photos():
    """Get default photos with caching to avoid repeated DB queries"""
    cache_key = "default_photos"
    cached_photos = cache.get(cache_key)
    
    if cached_photos is None:
        try:
            sample_photo = SamplePhoto.objects.first()
            if sample_photo:
                cached_photos = {
                    'profile_photo': sample_photo.profile_photo.url,
                    'blog_photo': sample_photo.blog_photo.url
                }
            else:
                cached_photos = {
                    'profile_photo': '/static/default_profile.jpg',
                    'blog_photo': '/static/default_blog.jpg'
                }
            # Cache for 1 hour
            cache.set(cache_key, cached_photos, 3600)
        except Exception:
            cached_photos = {
                'profile_photo': '/static/default_profile.jpg',
                'blog_photo': '/static/default_blog.jpg'
            }
    
    return cached_photos


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    id = serializers.CharField(read_only=True)
    password = serializers.CharField(
        write_only=True,
        help_text="Password must be at least 8 characters long",
        style={"input_type": "password"},
    )
    name = serializers.CharField(help_text="Full name of the user", max_length=50)
    email = serializers.EmailField(
        help_text="Valid email address for account verification", max_length=50
    )

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "password",
        ]

    def create(self, validated_data):
        user = super(SignupSerializer, self).create(validated_data)
        user.set_password(validated_data["password"])
        generate_otp(user)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""

    email = serializers.EmailField(max_length=50, help_text="Registered email address")
    password = serializers.CharField(
        max_length=50, help_text="User password", style={"input_type": "password"}
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset attempt"""

    new_password1 = serializers.CharField(
        max_length=128, help_text="New password", style={"input_type": "password"}
    )
    new_password2 = serializers.CharField(
        max_length=128,
        help_text="Confirm new password",
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        password1 = attrs["new_password1"]
        password2 = attrs["new_password2"]
        if str(password1) != str(password2):
            raise serializers.ValidationError("Password not matched")
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    
    email = serializers.EmailField(
        max_length=100, 
        help_text="Email address for password reset"
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    
    new_password = serializers.CharField(
        max_length=30,
        help_text="New password",
        style={"input_type": "password"}
    )


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""

    photo = serializers.SerializerMethodField(help_text="User profile photo URL")
    name = serializers.SerializerMethodField(help_text="User's full name")

    class Meta:
        model = User
        fields = ["id","name", "photo"]

    def get_name(self, obj) -> str:
        return obj.name.replace(" ", "-")

    def get_photo(self, obj) -> str:
        if obj.photo:
            photo = obj.photo.url
        else:
            # Use cached default photo instead of database query
            default_photos = get_cached_default_photos()
            photo = default_photos['profile_photo']
        get_host = self.context["get_host"]
        return f"https://{get_host}{photo}"


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information"""

    email = serializers.EmailField(required=False)
    photo = serializers.SerializerMethodField(help_text="User profile photo URL")
    name = serializers.CharField(help_text="User's full name")
    created_at = serializers.DateTimeField(
        read_only=True, help_text="Account creation timestamp"
    )

    class Meta:
        model = User
        fields = ["email", "name", "photo", "created_at"]

    def get_photo(self, obj) -> str:
        if obj.photo:
            photo = obj.photo.url
        else:
            # Use cached default photo instead of database query
            default_photos = get_cached_default_photos()
            photo = default_photos['profile_photo']
        get_host = self.context["get_host"]
        return f"https://{get_host}{photo}"


class BlogListSerializer(serializers.ModelSerializer):
    """Serializer for blog list display"""

    user = UserSerializer(read_only=True)
    photo = serializers.SerializerMethodField(help_text="Blog post featured image URL")
    title = serializers.CharField(help_text="Blog post title")
    description = serializers.CharField(help_text="Blog post content (HTML)")
    created_at = serializers.DateTimeField(
        read_only=True, help_text="Blog creation timestamp"
    )
    total_comments = serializers.SerializerMethodField(
        help_text="Total number of comments on the blog post"
    )
    total_likes = serializers.SerializerMethodField(
        help_text="Total number of likes on the blog post"
    )

    class Meta:
        model = Blog
        fields = (
            "id",
            "user",
            "title",
            "description",
            "photo",
            "status",
            "created_at",
            "updated_at",
            "total_comments",
            "total_likes"
        )

    def get_photo(self, obj) -> str:
        if obj.photo:
            photo = obj.photo.url
        else:
            # Use cached default photo instead of database query
            default_photos = get_cached_default_photos()
            photo = default_photos['blog_photo']
        get_host = self.context["get_host"]
        return f"https://{get_host}{photo}"

    def get_user(self, obj) -> str:
        return obj.user.name.replace(" ", "-")

    def get_total_comments(self, obj) -> int:
        # Try to use annotated field first, fallback to count query
        if hasattr(obj, 'comments_count'):
            return obj.comments_count
        return obj.comment_blogs.filter(parent_id=None).count()

    def get_total_likes(self, obj) -> int:
        # Try to use annotated field first, fallback to aggregate query
        if hasattr(obj, 'likes_count'):
            return obj.likes_count
        # Count the number of users who liked this blog
        return obj.like_blogs.aggregate(total_likes=models.Count("user"))["total_likes"]
    

class BlogSerializer(serializers.ModelSerializer):
    """Serializer for blog post display"""

    user = UserSerializer(read_only=True)
    photo = serializers.SerializerMethodField(help_text="Blog post featured image URL")
    title = serializers.CharField(help_text="Blog post title")
    description = serializers.CharField(help_text="Blog post content (HTML)")
    created_at = serializers.DateTimeField(
        read_only=True, help_text="Blog creation timestamp"
    )
    total_comments = serializers.SerializerMethodField(
        help_text="Total number of comments on the blog post"
    )
    comments = serializers.SerializerMethodField(
        help_text="List of comments on the blog post"
    )
    total_likes = serializers.SerializerMethodField(
        help_text="Total number of likes on the blog post"
    )

    class Meta:
        model = Blog
        fields = (
            "id",
            "user",
            "title",
            "description",
            "photo",
            "status",
            "created_at",
            "updated_at",
            "total_comments",
            "total_likes",
            "comments",
        )

    def get_photo(self, obj) -> str:
        if obj.photo:
            photo = obj.photo.url
        else:
            # Use cached default photo instead of database query
            default_photos = get_cached_default_photos()
            photo = default_photos['blog_photo']
        get_host = self.context["get_host"]
        return f"https://{get_host}{photo}"

    def get_user(self, obj) -> str:
        return obj.user.name.replace(" ", "-")

    def get_total_comments(self, obj) -> int:
        # Try to use annotated field first, fallback to count query
        if hasattr(obj, 'comments_count'):
            return obj.comments_count
        return obj.comment_blogs.filter(parent_id=None).count()

    def get_comments(self, obj) -> list:
        # Use prefetched comments if available to avoid N+1 queries
        if hasattr(obj, 'top_comments'):
            comments = obj.top_comments
        else:
            comments = obj.comment_blogs.filter(parent_id=None)[:3]
        
        return BlogCommentSerializer(comments, many=True, context=self.context).data

    def get_total_likes(self, obj) -> int:
        # Try to use annotated field first, fallback to aggregate query
        if hasattr(obj, 'likes_count'):
            return obj.likes_count
        # Count the number of users who liked this blog
        return obj.like_blogs.aggregate(total_likes=models.Count("user"))["total_likes"]


class CreateUpdateBlogSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating blog posts"""

    title = serializers.CharField(
        help_text="Blog post title (will be formatted with hyphens)", max_length=255
    )
    description = serializers.CharField(
        help_text="Blog post content (supports HTML from TinyMCE editor)"
    )
    photo = serializers.ImageField(
        required=False, help_text="Optional featured image for the blog post"
    )
    status = serializers.ChoiceField(
        choices=[(1, "Pending"), (2, "Published"), (3, "Archived")],
        help_text="Blog post status: 1=Pending, 2=Published, 3=Archived",
        default=1,
    )

    class Meta:
        model = Blog
        exclude = ("user",)

    def validate(self, attrs):
        title = attrs["title"].strip()
        title_check = title.replace(" ", "").replace("-", "")
        if not title_check.isalpha():
            raise serializers.ValidationError(
                {
                    "message": "title must be only string, special char or integer not allowed!"
                }
            )
        else:
            format_title = attrs["title"]
            title = format_title.replace(" ", "-")
            attrs["title"] = title
            return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""

    email = serializers.EmailField(required=False, help_text="User's email address")
    name = serializers.CharField(required=False, help_text="User's full name")
    photo = serializers.ImageField(required=False, help_text="User's profile photo")

    class Meta:
        model = User
        fields = ("name", "email", "photo")


class PaginationMetaSerializer(serializers.Serializer):
    """Serializer for pagination metadata"""

    current_page = serializers.IntegerField(help_text="Current page number")
    total_pages = serializers.IntegerField(help_text="Total number of pages")
    total_items = serializers.IntegerField(help_text="Total number of items")
    page_size = serializers.IntegerField(help_text="Number of items per page")
    has_next = serializers.BooleanField(help_text="Whether there is a next page")
    has_previous = serializers.BooleanField(
        help_text="Whether there is a previous page"
    )
    next_page = serializers.IntegerField(
        allow_null=True, help_text="Next page number (null if no next page)"
    )
    previous_page = serializers.IntegerField(
        allow_null=True, help_text="Previous page number (null if no previous page)"
    )


class PaginatedBlogResponseSerializer(serializers.Serializer):
    """Serializer for paginated blog response"""

    data = BlogSerializer(many=True, help_text="List of blog posts")
    pagination = PaginationMetaSerializer(help_text="Pagination metadata")
    filter_applied = serializers.DictField(
        required=False,
        allow_null=True,
        help_text="Applied filters information (only in UserBlogView)",
    )


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments"""

    comment_id = serializers.SerializerMethodField()
    comment_user = serializers.SerializerMethodField()
    blog_id = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.only('id'), write_only=True)
    blog = serializers.PrimaryKeyRelatedField(queryset=Blog.objects.only('id'), write_only=True)

    class Meta:
        model = Comment
        fields = [
            "comment_id",
            "comment_user",
            "user",
            "blog",
            "blog_id",
            "content",
            "parent_id",
            "created_at",
            "updated_at",
            "comments_count",
            "comments",
        ]

    def get_comment_id(self, obj):
        return obj.id

    def get_comment_user(self, obj):
        # Ensure context has get_host for UserSerializer
        context = self.context.copy() if self.context else {}
        if 'get_host' not in context:
            # Try to get from request if available
            request = context.get('request')
            if request:
                context['get_host'] = request.get_host()
            else:
                # Fallback to empty string or default host
                context['get_host'] = 'localhost:8000'  # or your default host
        
        return UserSerializer(obj.user, context=context).data

    def get_blog_id(self, obj):
        return obj.blog.id

    def get_comments_count(self, obj):
        # Try to use annotated field first, fallback to related manager count
        if hasattr(obj, 'replies_count'):
            return obj.replies_count
        return obj.comment_replies.count()

    def get_comments(self, obj):
        # Use prefetched data if available to avoid N+1 queries
        if hasattr(obj, 'prefetched_replies'):
            comments = obj.prefetched_replies
        else:
            # Limit replies to avoid performance issues with deeply nested comments
            comments = obj.comment_replies.select_related('user').all()
        return BlogCommentSerializer(comments, many=True, context=self.context).data


class BlogCommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments"""

    comment_id = serializers.SerializerMethodField()
    comment_user = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "comment_id",
            "comment_user",
            "content",
            "parent_id",
            "created_at",
            "updated_at",
            "comments_count",
        ]

    def get_comment_id(self, obj):
        return obj.id

    def get_comment_user(self, obj):
        # Ensure context has get_host for UserSerializer
        context = self.context.copy() if self.context else {}
        if 'get_host' not in context:
            # Try to get from request if available
            request = context.get('request')
            if request:
                context['get_host'] = request.get_host()
            else:
                # Fallback to empty string or default host
                context['get_host'] = 'localhost:8000'  # or your default host
        
        return UserSerializer(obj.user, context=context).data

    def get_comments_count(self, obj):
        # Try to use annotated field first, fallback to related manager count
        if hasattr(obj, 'replies_count'):
            return obj.replies_count
        return obj.comment_replies.count()

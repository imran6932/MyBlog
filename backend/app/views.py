import logging, traceback
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView
from django.db.models import Count, Prefetch, Q
from .pagination import CustomPageNumberPagination, CommentPagination
from .serializers import (
    BlogCommentSerializer,
    BlogListSerializer,
    BlogSerializer,
    CreateUpdateBlogSerializer,
    LoginSerializer,
    ProfileSerializer,
    SignupSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    ChangePasswordSerializer,
    UserUpdateSerializer,
    UserSerializer,
    CommentSerializer,
)
from .models import Blog, BlogStatus, Like, SamplePhoto, User, Comment
from .utils import (
    generate_otp,
    verify_otp,
    send_blog_review_email,
    send_user_blog_confirmation_email,
)
from .api_docs import (
    user_blog_view_get_schema,
    user_blog_view_detail_schema,
    all_blog_view_list_schema,
    all_blog_view_detail_schema,
    user_signup_schema,
    user_login_schema,
    generate_otp_schema,
    verify_otp_schema,
    password_reset_schema,
    password_reset_confirm_schema,
    comment_view_post_schema,
    comment_view_get_schema,
    comment_view_put_schema,
    comment_view_delete_schema,
    blog_all_comments_view_schema,
    like_view_post_schema,
    like_view_get_schema,
    user_blog_view_post_schema,
    user_blog_view_patch_schema,
    user_blog_view_delete_schema,
    change_password_schema,
    profile_get_schema,
    profile_patch_schema,
)
from .redis import (
    generate_cache_key,
    get_cached_data,
    set_cached_data,
    invalidate_cache_pattern
)

User = get_user_model()


def get_default_blog_photo():
    """Get default blog photo with caching to avoid repeated DB queries"""
    cache_key = generate_cache_key("default_blog_photo")
    photo_url = get_cached_data(cache_key)

    if photo_url is None:
        try:
            sample_photo = SamplePhoto.objects.only("blog_photo").first()
            if sample_photo and sample_photo.blog_photo:
                photo_url = sample_photo.blog_photo.url
            else:
                photo_url = "/static/default_blog.jpg"  # Fallback
            # Cache for 24 hours (86400 seconds)
            set_cached_data(cache_key, photo_url, 84400)
        except SamplePhoto.DoesNotExist:
            photo_url = "/static/default_blog.jpg"
            set_cached_data(cache_key, photo_url, 84400)

    return photo_url


class UserSignupView(APIView):
    """User Signup"""

    serializer_class = SignupSerializer

    @user_signup_schema
    def post(self, request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        else:
            errors = [key for key, value in serializer.errors.items()]
            error_list = [
                {
                    "message": f"{errors} - {value}".replace("[", "").replace("]", ""),
                }
                for key, value in serializer.errors.items()
            ][0]

            return Response(error_list, 400)


class UserLoginView(APIView):
    """User Login"""

    serializer_class = LoginSerializer

    @user_login_schema
    def post(self, request):
        try:
            data = request.data
            serializer = self.serializer_class(data=data)
            if serializer.is_valid():

                user = authenticate(username=data["email"], password=data["password"])
                if user is not None:
                    if user.is_verified:
                        access_token = AccessToken.for_user(user=user)
                        res = {
                            "id": user.id,
                            "user": user.name.replace(" ", "-"),
                            "email": user.email,
                            "access_token": str(access_token),
                        }

                        return Response({"data": res})
                    else:
                        return Response(
                            {"message": "user is not verified", "email": user.email},
                            400,
                        )

                return Response(
                    {"message": "You have entered invalid email or password."},
                    400,
                )
            errors = [key for key, value in serializer.errors.items()]
            error_list = [
                {
                    "message": f"{errors} - {value}".replace("[", "").replace("]", ""),
                }
                for key, value in serializer.errors.items()
            ][0]

            return Response(error_list, 400)

        except Exception as e:
            logging.info(f"UserLoginView exception- {str(e)}\n")
            return Response(
                {"message": f"something went wrong Exception- {str(e)}"}, 422
            )


class GenerateOTP(APIView):
    """Generate OTP"""

    @generate_otp_schema
    def get(self, request, *args, **kwargs):
        try:
            logging.info(
                f"Generate OTP GET data- | User- {request.user} | {request.query_params}\n"
            )
            email = request.query_params.get("email")
            if not email:
                return Response({"message": "Email parameter is required"}, 400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"message": "User not found"}, 404)
            otp, msg = generate_otp(user)

            if otp and otp == True:
                return Response(
                    {
                        "message": "OTP has sent on your email",
                        "email": email,
                    }
                )

            else:
                return Response(
                    {
                        "message": f"Email not sent- {str(msg)}",
                        "email": email,
                    },
                    400,
                )

        except Exception as e:
            logging.error(
                f"Generate OTP GET exception- | User- {request.user} | {traceback.format_exc()}\n"
            )
            return Response({"message": f"something went wrong- {str(e)}"}, 422)


class AccountVerifyOTP(APIView):
    """Account Verify OTP"""

    @verify_otp_schema
    def get(self, request):
        try:
            logging.info(
                f"Verify OTP GET data- | User- {request.user} | {request.query_params}\n"
            )
            email = request.query_params.get("email")
            if not email:
                return Response({"message": "Email parameter is required"}, 400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"message": "User not found"}, 404)

            if user.is_verified:
                return Response({"message": "User has already verified"})

            otp = request.query_params.get("otp")
            if not otp:
                return Response({"message": "OTP parameter is required"}, 400)
            otp = verify_otp(user=user, otp=otp)
            token = AccessToken.for_user(user=user)
            if otp and otp == True:
                res = Response(
                    {
                        "message": "OTP verified successfully",
                        "access_token": str(token),
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                    }
                )
                res.set_cookie(
                    key="access_token",
                    value=str(token),
                    httponly=True,
                    secure=True,  # Only secure in production
                    samesite="Lax",
                )
                return res
            elif otp:
                return Response({"message": otp})
            else:
                return Response({"message": "OTP Wrong or Expired!"}, 400)
        except Exception as e:
            logging.error(
                f"Verify OTP GET exception- | User- {request.user} | {traceback.format_exc()}\n"
            )
            return Response({"message": f"something went wrong- {str(e)}"}, 422)


class PasswordResetView(APIView):
    """Password reset OTP email send to the user"""

    serializer_class = PasswordResetSerializer

    @password_reset_schema
    def post(self, request):
        try:
            logging.info(
                f"Password reset OTP POST data- | User- {request.user} | {request.data}\n"
            )
            email = request.data["email"]
            user = User.objects.filter(email=email).exists()
            if user:
                user = User.objects.get(email=email)

                otp, msg = generate_otp(user)
                if otp:
                    logging.info(f"Password reset OTP sent successfully User-{email}\n")
                    return Response(
                        {
                            "message": "Password reset OTP sent successfully",
                            "email": email,
                        }
                    )
                else:
                    logging.info(
                        f"Password reset email not sent error User-{email} | {str(msg)}\n"
                    )
                    return Response(
                        {
                            "message": f"Email not sent- {str(msg)}",
                            "email": email,
                        },
                        422,
                    )
            else:
                logging.info(f"User Email does not exist User-{email}\n")
                return Response(
                    {"message": "User Email does not exist"},
                    400,
                )
        except Exception as e:
            logging.error(
                f"Password reset OTP POST exception- | User- {request.user} | {traceback.format_exc()}\n"
            )
            return Response({"message": str(e)}, 422)


class PasswordResetConfirmView(APIView):
    """Verify and confirm Password reset OTP and set New Password"""

    serializer_class = PasswordResetConfirmSerializer

    @password_reset_confirm_schema
    def post(self, request):
        try:
            logging.info(
                f"Password reset confirm  POST data- | User- {request.user} | {request.data}\n"
            )
            email = request.data["email"]
            entered_otp = request.data["otp"]
            user = User.objects.get(email=email)
            otp = verify_otp(user, entered_otp)
            if otp:
                serializer = self.serializer_class(data=request.data)
                serializer.is_valid(raise_exception=True)
                if request.data["new_password1"] == request.data["new_password2"]:
                    user.set_password(request.data["new_password1"])
                    user.save()

                    logging.info(
                        f"Password has been reset with the new password. User-{email}"
                    )
                    return Response(
                        {"message": "Password has been reset with the new password."},
                    )
                else:
                    logging.error(f"Password not matched. User-{email}")
                    return Response({"message": "Password not matched"}, 400)

            else:
                logging.error(f"Invalid or Expired OTP. User-{email}")
                return Response({"message": "Invalid or Expired OTP"}, 400)
        except Exception as e:
            logging.error(
                f"Password reset confirm POST exception- | User- {request.user} | {traceback.format_exc()}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)


class ChangePasswordView(APIView):
    """User Password change"""

    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @change_password_schema
    def post(self, request):
        try:
            new_password = request.data["new_password"]

            user = User.objects.get(email=request.user.email)
            if user is not None:
                user.set_password(new_password)
                user.save()
                return Response({"message": "password changed successfully"})
            logging.error(
                f"Change old password Exception error-| User- {request.user}\n"
            )
            return Response({"message": "user not found"}, 400)
        except Exception as e:
            logging.error(
                f"Change Password POST Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)


class BlogCreateListView(ListCreateAPIView):
    """Create a new blog post and list user's blog posts using DRF pagination"""

    serializer_class = BlogListSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer class based on request method"""
        if self.request.method == 'POST':
            return CreateUpdateBlogSerializer
        return BlogListSerializer
    
    def get_queryset(self):
        """Get optimized queryset of user's blogs"""
        status_filter = self.request.query_params.get("status", None)
        
        queryset = Blog.objects.select_related("user").filter(
            user=self.request.user
        ).prefetch_related(
            # Prefetch only parent comments (top-level) to avoid filtering later
            Prefetch(
                "comment_blogs",
                queryset=Comment.objects.filter(parent_id=None).select_related("user")[:3],
                to_attr="top_comments"
            ),
        ).annotate(
            comments_count=Count("comment_blogs", filter=Q(comment_blogs__parent_id=None), distinct=True),
            likes_count=Count("like_blogs__user", distinct=True)
        )
        
        if status_filter:
            try:
                status_value = int(status_filter)
                queryset = queryset.filter(status=status_value)
            except ValueError:
                # Return empty queryset for invalid status
                return Blog.objects.none()
        
        return queryset.order_by("-created_at")

    @user_blog_view_get_schema
    def get(self, request, *args, **kwargs):
        """Override get method to add caching while using DRF pagination"""
        try:
            # Early cache check - BEFORE authentication/authorization processing
            # We need user ID, so we'll do minimal auth check first
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            user_id = None
            
            if auth_header.startswith('Bearer '):
                try:
                    # Quick token decode to get user_id without full authentication
                    from rest_framework_simplejwt.tokens import AccessToken
                    token = auth_header.split(' ')[1]
                    access_token = AccessToken(token)
                    user_id = access_token['user_id']
                except:
                    # If token is invalid, let normal auth handle it
                    pass
            
            if user_id:
                # Check cache first with user_id from token
                status_filter = request.query_params.get("status", None)
                page_number = request.query_params.get("page", 1)
                cache_key = generate_cache_key(
                    "user_blogs_list", 
                    user_id=user_id, 
                    status=status_filter, 
                    page=page_number
                )
                cached_data = get_cached_data(cache_key)
                
                if cached_data:
                    return Response(cached_data)
            
            # If no cache hit, proceed with normal DRF processing
            response = super().get(request, *args, **kwargs)

            # Cache the response for 24 hours
            if user_id:
                status_filter = request.query_params.get("status", None)
                page_number = request.query_params.get("page", 1)
                cache_key = generate_cache_key(
                    "user_blogs_list", 
                    user_id=user_id, 
                    status=status_filter, 
                    page=page_number
                )
                set_cached_data(cache_key, response.data, 86400)

            return response
            
        except Exception as e:
            logging.error(
                f"User Blog list GET Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)

    def get_serializer_context(self):
        """Add get_host to serializer context"""
        context = super().get_serializer_context()
        context['get_host'] = self.request.get_host()
        return context

    def perform_create(self, serializer, user):
        """Custom create logic with caching invalidation"""
        try:
            # Set status to pending for review
            blog = serializer.save(user=user, status=BlogStatus.PENDING)
            
            # Invalidate cache for this user's blogs
            invalidate_cache_pattern(f"user_blog_*_user_{user.id}_*")
            invalidate_cache_pattern(f"all_blog_*")  # Also invalidate public blog cache
            invalidate_cache_pattern(f"user_blogs_list_user_id_{user.id}_*")  # User blog list cache
            
            # Send email notifications asynchronously (non-blocking)
            try:
                # Queue email tasks asynchronously - these won't block the response
                send_blog_review_email(blog, "created")
                send_user_blog_confirmation_email(blog, "created")
            except Exception as email_error:
                # Log email errors but don't fail the response
                logging.error(
                    f"Email notifications exception: {str(email_error)} | Blog ID: {blog.id}"
                )
            
            return blog
            
        except Exception as e:
            logging.error(
                f"Create blog POST Exception error- {traceback.format_exc()} | User- {user}\n"
            )
            raise

    @user_blog_view_post_schema
    def post(self, request, *args, **kwargs):
        """Create a new blog post"""
        try:
            serializer = CreateUpdateBlogSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            obj = self.perform_create(serializer, request.user)
            
            # Prepare custom response data
            if obj.photo:
                photo = obj.photo.url
            else:
                photo = get_default_blog_photo()

            data = {
                "user": UserSerializer(
                    obj.user, context={"get_host": request.get_host()}
                ).data,
                "id": obj.id,
                "title": obj.title,
                "description": obj.description,
                "photo": f"https://{request.get_host()}{photo}",
                "status": obj.status,
                "created_at": obj.created_at,
                "updated_at": obj.updated_at,
                "total_comments": obj.comment_blogs.filter(parent_id=None).count(),
                "total_likes": obj.like_blogs.aggregate(total_likes=Count("user"))[
                    "total_likes"
                ],
                "comments": BlogCommentSerializer(
                    obj.comment_blogs.filter(parent_id=None)[:3], many=True, context={"get_host": request.get_host()}
                ).data,
            }

            return Response(
                {
                    "message": "blog has created and review in progress",
                    "data": data,
                },
                status.HTTP_201_CREATED,
            )
            
        except Exception as e:
            logging.error(
                f"Create blog POST Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)


class BlogRUDView(APIView):
    """User Blog View"""

    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, id, user):
        obj = Blog.objects.select_related("user").filter(
            id=id, user_id=user.id  # Use user_id instead of user object for better performance
        ).prefetch_related(
            # Prefetch only parent comments (top-level) to avoid filtering later
            Prefetch(
                "comment_blogs",
                queryset=Comment.objects.filter(parent_id=None).select_related("user")[:3],
                to_attr="top_comments"
            ),
        ).annotate(
            # Count total comments and likes for efficient access
            comments_count=Count("comment_blogs", filter=Q(comment_blogs__parent_id=None), distinct=True),
            likes_count=Count("like_blogs__user", distinct=True)
        ).first()  # Use .first() instead of checking if obj exists
        return obj

    @user_blog_view_detail_schema
    def get(self, request, id):
        """Get a specific user's blog post by ID"""
        try:
            # Early cache check - BEFORE authentication/authorization processing
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            user_id = None
            
            if auth_header.startswith('Bearer '):
                try:
                    # Quick token decode to get user_id without full authentication
                    from rest_framework_simplejwt.tokens import AccessToken
                    token = auth_header.split(' ')[1]
                    access_token = AccessToken(token)
                    user_id = access_token['user_id']
                except:
                    # If token is invalid, let normal auth handle it
                    pass
            
            if user_id:
                # Check cache first with user_id from token
                cache_key = generate_cache_key("user_blog_detail", user_id=user_id, blog_id=id)
                cached_data = get_cached_data(cache_key)

                if cached_data:
                    return Response(cached_data)
            
            # If no cache hit, proceed with normal authentication and processing
            obj = self.get_object(id, request.user)
            if obj:
                if obj.photo:
                    photo = obj.photo.url
                else:
                    photo = get_default_blog_photo()
                data = {
                    "user": UserSerializer(
                        obj.user, context={"get_host": request.get_host()}
                    ).data,
                    "id": obj.id,
                    "title": obj.title,
                    "description": obj.description,
                    "photo": f"https://{request.get_host()}{photo}",
                    "status": obj.status,
                    "created_at": obj.created_at,
                    "updated_at": obj.updated_at,
                    # Use annotated counts when available, fallback to manual count
                    "total_comments": getattr(obj, 'comments_count', 0) or obj.comment_blogs.filter(parent_id=None).count(),
                    "total_likes": getattr(obj, 'likes_count', 0) or obj.like_blogs.aggregate(
                        total_likes=Count("user")
                    )["total_likes"] or 0,
                    "comments": BlogCommentSerializer(
                        getattr(obj, 'top_comments', obj.comment_blogs.filter(parent_id=None)[:3]), many=True, context={"get_host": request.get_host()}
                    ).data,
                }
                response_data = {"data": data}
                
                # Cache the response for 24 hours using user_id
                cache_key = generate_cache_key("user_blog_detail", user_id=request.user.id, blog_id=id)
                set_cached_data(cache_key, response_data)
                return Response(response_data)
            return Response({"message": "blog does not exist"}, 400)
        except Exception as e:
            logging.error(
                f"Get blog GET Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)

    @user_blog_view_patch_schema
    def patch(self, request, id):
        try:
            data = request.data
            instance = self.get_object(id, request.user)

            if instance:
                # Store original status for comparison
                original_status = instance.status

                serializer = CreateUpdateBlogSerializer(instance=instance, data=data)
                if serializer.is_valid():
                    # Set status to archived for review if archived
                    if "status" in data and data["status"] == BlogStatus.ARCHIVED:
                        instance.status = BlogStatus.ARCHIVED
                    else:
                        # If status not provided in update, set to pending for review
                        instance.status = BlogStatus.PENDING

                    serializer.save()

                    # Invalidate cache for this user's blogs
                    invalidate_cache_pattern(f"user_blog_*_user_{request.user.id}_*")
                    invalidate_cache_pattern(f"all_blog_*")  # Also invalidate public blog cache
                    invalidate_cache_pattern(f"user_blogs_list_user_id_{request.user.id}_*")  # User blog list cache

                    # Send email notifications only if content was actually updated
                    content_updated = any(
                        field in data
                        for field in ["title", "description", "photo", "status"]
                    )
                    if content_updated or instance.status != original_status:
                        try:
                            # Send email to reviewer
                            email_sent, email_msg = send_blog_review_email(
                                instance, "updated"
                            )
                            if not email_sent:
                                logging.warning(
                                    f"Blog review email failed: {email_msg} | Blog ID: {instance.id}"
                                )

                            # Send confirmation email to user
                            user_email_sent, user_email_msg = (
                                send_user_blog_confirmation_email(instance, "updated")
                            )
                            if not user_email_sent:
                                logging.warning(
                                    f"User confirmation email failed: {user_email_msg} | Blog ID: {instance.id}"
                                )

                        except Exception as email_error:
                            logging.error(
                                f"Email notifications exception: {str(email_error)} | Blog ID: {instance.id}"
                            )

                    # photo = instance.photo.url
                    if instance.photo:
                        photo = instance.photo.url
                    else:
                        photo = get_default_blog_photo()
                    data = {
                        "user": UserSerializer(
                            instance.user, context={"get_host": request.get_host()}
                        ).data,
                        "id": instance.id,
                        "title": instance.title,
                        "description": instance.description,
                        "photo": f"https://{request.get_host()}{photo}",
                        "status": instance.status,
                        "created_at": instance.created_at,
                        "updated_at": instance.updated_at,
                        "total_comments": instance.comment_blogs.filter(parent_id=None).count(),
                        "total_likes": instance.like_blogs.aggregate(
                            total_likes=Count("user")
                        )["total_likes"],
                        "comments": BlogCommentSerializer(
                            instance.comment_blogs.filter(parent_id=None)[:3], many=True, context={"get_host": request.get_host()}
                        ).data,
                    }
                    return Response(
                        {"message": "blog updated and review in progress", "data": data}
                    )
                errors = [key for key, value in serializer.errors.items()]
                error_list = [
                    {
                        "message": f"{errors} - {value}".replace("[", "").replace(
                            "]", ""
                        ),
                    }
                    for key, value in serializer.errors.items()
                ][0]
                return Response(error_list, 400)
            return Response({"message": "blog does not exist"}, 400)
        except Exception as e:
            logging.error(
                f"Update blog PATCH Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)

    @user_blog_view_delete_schema
    def delete(self, request, id):
        try:
            instance = self.get_object(id, request.user)
            if instance:
                instance.delete()
                
                # Invalidate cache for this user's blogs
                invalidate_cache_pattern(f"user_blog_*_user_{request.user.id}_*")
                invalidate_cache_pattern(f"all_blog_*")  # Also invalidate public blog cache
                invalidate_cache_pattern(f"user_blogs_list_user_id_{request.user.id}_*")  # User blog list cache
                
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response({"message": "blog does not exist"}, 400)
        except Exception as e:
            logging.error(
                f"Delete blog DELETE Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)


class AllBlogListView(ListAPIView):
    """All Blog List View - Get paginated list of published blogs using DRF pagination"""

    serializer_class = BlogListSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Get optimized queryset of published blogs"""
        return Blog.objects.select_related("user").filter(
            status=BlogStatus.PUBLISHED
        ).prefetch_related(
            # Prefetch only parent comments (top-level) to avoid filtering later
            Prefetch(
                "comment_blogs",
                queryset=Comment.objects.filter(parent_id=None).select_related("user")[:3],
                to_attr="top_comments"
            ),
        ).annotate(
            # Count total comments and likes for efficient access
            comments_count=Count("comment_blogs", filter=Q(comment_blogs__parent_id=None), distinct=True),
            likes_count=Count("like_blogs__user", distinct=True)
        ).order_by("-created_at")

    @all_blog_view_list_schema
    def get(self, request, *args, **kwargs):
        """Override get method to add caching while using DRF pagination"""
        try:
            # Cache key for all blog list
            page_number = request.query_params.get("page", 1)
            cache_key = generate_cache_key("all_blog_list", page=page_number)
            cached_data = get_cached_data(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Use DRF's built-in pagination
            response = super().get(request, *args, **kwargs)
            
            # Cache the response for 24 hours
            set_cached_data(cache_key, response.data)
            return response
            
        except Exception as e:
            logging.error(
                f"Get blog list GET Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)

    def get_serializer_context(self):
        """Add get_host to serializer context"""
        context = super().get_serializer_context()
        context['get_host'] = self.request.get_host()
        return context


class AllBlogDetailView(APIView):
    """All Blog Detail View - Get single published blog"""

    serializer_class = BlogSerializer

    def get_object(self, id):
        obj = Blog.objects.select_related("user").filter(
            id=id, status=BlogStatus.PUBLISHED
        ).prefetch_related(
            # Prefetch only parent comments (top-level) to avoid filtering later
            Prefetch(
                "comment_blogs",
                queryset=Comment.objects.filter(parent_id=None).select_related("user")[:3],
                to_attr="top_comments"
            ),
        ).annotate(
            # Count total comments and likes for efficient access
            comments_count=Count("comment_blogs", filter=Q(comment_blogs__parent_id=None), distinct=True),
            likes_count=Count("like_blogs__user", distinct=True)
        ).first()  # Use .first() instead of checking if obj exists
        return obj

    @all_blog_view_detail_schema
    def get(self, request, id):
        try:
            # Cache key for single blog detail
            cache_key = generate_cache_key("all_blog_detail", blog_id=id)
            cached_data = get_cached_data(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            obj = self.get_object(id)
            if obj:
                if obj.photo:
                    photo = obj.photo.url
                else:
                    photo = get_default_blog_photo()
                data = {
                    "user": UserSerializer(
                        obj.user, context={"get_host": request.get_host()}
                    ).data,
                    "id": obj.id,
                    "title": obj.title,
                    "description": obj.description,
                    "photo": f"https://{request.get_host()}{photo}",
                    "status": obj.status,
                    "created_at": obj.created_at,
                    "updated_at": obj.updated_at,
                    "total_comments": getattr(obj, 'comments_count', 0) or obj.comment_blogs.filter(parent_id=None).count(),
                    "total_likes": getattr(obj, 'likes_count', 0) or obj.like_blogs.aggregate(total_likes=Count("user"))[
                        "total_likes"
                    ] or 0,
                    "comments": BlogCommentSerializer(
                        getattr(obj, 'top_comments', obj.comment_blogs.filter(parent_id=None)[:3]), many=True, context={"get_host": request.get_host()}
                    ).data,
                }
                response_data = {"data": data}
                
                # Cache the response for 24 hours
                set_cached_data(cache_key, response_data)
                return Response(response_data)
            return Response({"message": "blog does not exist"}, 400)
        except Exception as e:
            logging.error(
                f"Get blog detail GET Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)


class ProfileView(APIView):
    """user profile view"""

    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    @profile_get_schema
    def get(self, request):
        try:
            user = User.objects.filter(email=request.user.email).first()
            serializer = self.serializer_class(
                user, context={"get_host": request.get_host()}
            )

            return Response({"data": serializer.data})

        except Exception as e:
            logging.error(
                f"Get Profile GET Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)

    @profile_patch_schema
    def patch(self, request):
        try:
            instance = User.objects.get(email=request.user.email)
            serializer = UserUpdateSerializer(instance=instance, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "profile updated", "data": serializer.data})
            errors = [key for key, value in serializer.errors.items()]
            error_list = [
                {
                    "message": f"{errors} - {value}".replace("[", "").replace("]", ""),
                }
                for key, value in serializer.errors.items()
            ][0]
            return Response(error_list, 400)
        except Exception as e:
            logging.error(
                f"Get Profile PATCH Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)


class CommentCreateView(APIView):
    """Create a new comment"""

    serializer_class = CommentSerializer

    @comment_view_post_schema
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"get_host": request.get_host()})
        if serializer.is_valid():
            comment = serializer.save(user=request.user)
            
            # Invalidate specific caches using proper cache key prefixes
            invalidate_cache_pattern("user_blog_detail")  # User blog detail caches
            invalidate_cache_pattern("user_blogs_list")   # User blog list caches
            invalidate_cache_pattern("all_blog_detail")   # Public blog detail caches
            invalidate_cache_pattern("all_blog_list")     # Public blog list caches
            invalidate_cache_pattern("blog_comments")     # Blog comment list caches
            invalidate_cache_pattern("blog_likes")        # Blog likes caches
            invalidate_cache_pattern("comment_detail")    # All comment detail caches
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentRUDView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = CommentSerializer

    @comment_view_get_schema
    def get(self, request, pk=None):
        if pk:
            # Cache key for single comment
            cache_key = generate_cache_key("comment_detail", comment_id=pk)
            cached_data = get_cached_data(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Optimized query with prefetching for nested comments
            comment = Comment.objects.select_related("user", "blog").prefetch_related(
                Prefetch(
                    'comment_replies',
                    queryset=Comment.objects.select_related('user'),
                    to_attr='prefetched_replies'
                )
            ).annotate(
                replies_count=Count('comment_replies', distinct=True)
            ).filter(pk=pk).first()
            
            if not comment:
                return Response(
                    {"message": "Comment not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
                
            serializer = self.serializer_class(comment, context={"get_host": request.get_host()})
            response_data = serializer.data

            # Cache the response for 24 hours
            set_cached_data(cache_key, response_data, 86400)
            return Response(response_data)
        else:
            return Response(
                {"message": "Comment ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @comment_view_put_schema
    def patch(self, request, pk):
        # Optimized query for the comment
        comment = Comment.objects.select_related("user", "blog").filter(pk=pk).first()
        if not comment:
            return Response(
                {"message": "Comment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            
        if comment.user != request.user:
            return Response(
                {"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.serializer_class(comment, data=request.data, partial=True, context={"get_host": request.get_host()})
        if serializer.is_valid():
            serializer.save()
            
            # Invalidate specific caches using proper cache key prefixes
            invalidate_cache_pattern("user_blog_detail")  # User blog detail caches
            invalidate_cache_pattern("user_blogs_list")   # User blog list caches
            invalidate_cache_pattern("all_blog_detail")   # Public blog detail caches
            invalidate_cache_pattern("all_blog_list")     # Public blog list caches
            invalidate_cache_pattern("blog_comments")     # Blog comment list caches
            invalidate_cache_pattern("blog_likes")        # Blog likes caches
            invalidate_cache_pattern("comment_detail")    # All comment detail caches
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @comment_view_delete_schema
    def delete(self, request, pk):
        # Optimized query for the comment
        comment = Comment.objects.select_related("user", "blog").filter(pk=pk).first()
        if not comment:
            return Response(
                {"message": "Comment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
            
        if comment.user != request.user:
            return Response(
                {"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        
        # Invalidate specific caches using proper cache key prefixes
        invalidate_cache_pattern("user_blog_detail")  # User blog detail caches
        invalidate_cache_pattern("user_blogs_list")   # User blog list caches
        invalidate_cache_pattern("all_blog_detail")   # Public blog detail caches
        invalidate_cache_pattern("all_blog_list")     # Public blog list caches
        invalidate_cache_pattern("blog_comments")     # Blog comment list caches
        invalidate_cache_pattern("blog_likes")        # Blog likes caches
        invalidate_cache_pattern("comment_detail")    # All comment detail caches
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class BlogAllCommentsView(ListAPIView):
    """All comments for a specific blog post with DRF pagination"""

    serializer_class = BlogCommentSerializer
    pagination_class = CommentPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Get optimized queryset of comments for the specified blog"""
        blog_id = self.kwargs['blog_id']
        blog = get_object_or_404(Blog, id=blog_id, status=BlogStatus.PUBLISHED)
        
        return Comment.objects.select_related("user", "blog").filter(
            blog=blog, parent_id=None
        ).prefetch_related(
            # Prefetch child comments with limited count for performance
            Prefetch(
                'comment_replies',
                queryset=Comment.objects.select_related('user')[:10],
                to_attr='prefetched_replies'
            )
        ).annotate(
            # Count replies for efficient access
            replies_count=Count("comment_replies", distinct=True)
        ).order_by("-created_at")

    @blog_all_comments_view_schema
    def get(self, request, blog_id):
        """Override get method for custom response format with caching"""
        try:
            # Cache key for blog comments
            page_number = request.query_params.get("page", 1)
            cache_key = generate_cache_key("blog_comments", blog_id=blog_id, page=page_number)
            cached_data = get_cached_data(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            self.kwargs['blog_id'] = blog_id  # Store blog_id for get_queryset
            response = super().get(request, blog_id)

            # Cache the response for 1 hour (comments change frequently)
            set_cached_data(cache_key, response.data, 3600)
            return response
            
        except Exception as e:
            logging.error(
                f"Get Blog Comments GET Exception error- {traceback.format_exc()} | User- {request.user}\n"
            )
            return Response({"message": f"Exception- {str(e)}"}, 422)

    def get_serializer_context(self):
        """Add get_host to serializer context"""
        context = super().get_serializer_context()
        context['get_host'] = self.request.get_host()
        return context

class LikeBlogView(APIView):
    permission_classes = [IsAuthenticated]

    @like_view_post_schema
    def post(self, request):
        """Add a like to a blog."""
        blog_id = request.data.get("blog_id")
        blog = get_object_or_404(Blog, id=blog_id, status=BlogStatus.PUBLISHED)
        
        like, created = Like.objects.get_or_create(blog=blog)
        if request.user in like.user.all():
            like.user.remove(request.user)
            
            # Invalidate specific caches
            invalidate_cache_pattern(f"user_blog_*")  # User blog caches
            invalidate_cache_pattern(f"all_blog_*")   # Public blog caches
            invalidate_cache_pattern(f"blog_likes_blog_id_{blog_id}")  # Blog likes
            invalidate_cache_pattern(f"user_blogs_list_*")  # User blog lists
            
            return Response(
                {"message": "Blog unliked successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        like.user.add(request.user)
        
        # Invalidate specific caches
        invalidate_cache_pattern(f"user_blog_*")  # User blog caches
        invalidate_cache_pattern(f"all_blog_*")   # Public blog caches
        invalidate_cache_pattern(f"blog_likes_blog_id_{blog_id}")  # Blog likes
        invalidate_cache_pattern(f"user_blogs_list_*")  # User blog lists
        
        return Response(
            {"message": "Blog liked successfully."}, status=status.HTTP_201_CREATED
        )

    @like_view_get_schema
    def get(self, request):
        """Get all users who liked a specific blog."""
        blog_id = request.query_params.get("blog_id")
        if not blog_id:
            return Response(
                {"message": "blog_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cache key for blog likes
        cache_key = generate_cache_key("blog_likes", blog_id=blog_id)
        cached_data = get_cached_data(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        likes = get_object_or_404(Like, blog=blog_id)
        users = likes.user.all()
        serializer = UserSerializer(
            users, many=True, context={"get_host": request.get_host()}
        )
        response_data = {"data": serializer.data}

        # Cache the response for 1 hour (likes change frequently)
        set_cached_data(cache_key, response_data, 3600)
        return Response(response_data)

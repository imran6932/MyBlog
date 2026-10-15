from app import views
from app.health import HealthCheckView, CacheStatsView, CacheManagementView
from django.urls import path

urlpatterns = [
    # Health and monitoring endpoints
    path("health", HealthCheckView.as_view(), name="health-check"),
    path("health/cache-stats", CacheStatsView.as_view(), name="cache-stats"),
    path("health/cache-manage", CacheManagementView.as_view(), name="cache-manage"),
    
    # User authentication endpoints
    path("sign-up", views.UserSignupView.as_view(), name="sign-up"),
    path("login", views.UserLoginView.as_view(), name="login"),
    path("verify-otp", views.AccountVerifyOTP.as_view(), name="verify-otp"),
    path("generate-otp", views.GenerateOTP.as_view(), name="generate-otp"),
    path("change-password", views.ChangePasswordView.as_view(), name="change-password"),
    path(
        "request-reset-password",
        views.PasswordResetView.as_view(),
        name="request-reset-password",
    ),
    path(
        "confirm-reset-password",
        views.PasswordResetConfirmView.as_view(),
        name="confirm-reset-password",
    ),
    
    # Blog endpoints
    path("blog", views.BlogCreateListView.as_view(), name="blog-create"),
    path("blog/<int:id>", views.BlogRUDView.as_view(), name="blog-detail"),
    path("all-blog", views.AllBlogListView.as_view(), name="all-blog"),
    path(
        "all-blog/<int:id>", views.AllBlogDetailView.as_view(), name="all-blog-detail"
    ),
    
    # User profile
    path("profile", views.ProfileView.as_view(), name="profile"),
    
    # Comment endpoints
    path("comments", views.CommentCreateView.as_view(), name="comment-create"),
    path("comments/<int:pk>", views.CommentRUDView.as_view(), name="comment-detail"),
    path(
        "all-comments/<int:blog_id>",
        views.BlogAllCommentsView.as_view(),
        name="blog-all-comments",
    ),
    
    # Like endpoints
    path("like-blog", views.LikeBlogView.as_view(), name="like-blog"),
]

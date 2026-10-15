import os
from django.utils import timezone
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", default=True) == "True"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", default="*").split(",")

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    "drf_spectacular",
    "django_celery_beat",
    "django_celery_results",
    "app.apps.AppConfig",
    "tinymce",
    "django_cleanup.apps.CleanupConfig"
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB"),
        "USER": os.environ.get("POSTGRES_USER"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "HOST": os.environ.get("POSTGRES_HOST"),
        "PORT": os.environ.get("POSTGRES_PORT"),
    }
}

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get("REDIS_URL", default='redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 20,
                'retry_on_timeout': True,
            },
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'IGNORE_EXCEPTIONS': True,  # Don't fail if Redis is down
        },
        'KEY_PREFIX': 'blog_app',
        'VERSION': 1,
        'TIMEOUT': 60 * 60 * 24,  # 24 hours default timeout
    }
}

# Cache key prefix for this application
CACHE_KEY_PREFIX = 'blog_app'

# Redis connection settings
REDIS_URL = os.environ.get("REDIS_URL", default='redis://127.0.0.1:6379/1')

# Session cache (optional: use Redis for sessions too)
# Use cached_db for better resilience - falls back to DB if Redis fails
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7  # 1 week

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTH_USER_MODEL = "app.User"

# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"
# STATICFILES_DIRS = [BASE_DIR / 'assets']
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# File Upload Settings
# Maximum size for uploaded files (5MB)
FILE_UPLOAD_MAX_MEMORY_SIZE = os.environ.get("FILE_UPLOAD_MAX_MEMORY_SIZE", default=5242880)
DATA_UPLOAD_MAX_MEMORY_SIZE = os.environ.get("DATA_UPLOAD_MAX_MEMORY_SIZE", default=5242880)
# Maximum size for request body (5MB)
DATA_UPLOAD_MAX_NUMBER_FIELDS = os.environ.get("DATA_UPLOAD_MAX_NUMBER_FIELDS", default=10000)

# Temporary file upload settings
FILE_UPLOAD_TEMP_DIR = BASE_DIR / "tmp"
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Create temp directory if it doesn't exist
import os
os.makedirs(FILE_UPLOAD_TEMP_DIR, exist_ok=True)

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS Settings
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", default="").split(",")

CSRF_TRUSTED_ORIGINS = os.environ.get("CSRF_TRUSTED_ORIGINS", default="").split(",")

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=int(os.environ.get("ACCESS_TOKEN_LIFETIME", default=7))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.environ.get("REFRESH_TOKEN_LIFETIME", default=30))),
}

# REST Settings
APPEND_SLASH = False

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "app.pagination.CustomPageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle"
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.environ.get("ANON_THROTTLE_RATE", default="5/minute"),
        "user": os.environ.get("USER_THROTTLE_RATE", default="10/minute")
    }
}

# DRF Spectacular settings for API documentation
SPECTACULAR_SETTINGS = {
    "TITLE": "Blog DRF Backend API",
    "DESCRIPTION": "A Django REST Framework-based backend API for a blog application with user authentication, blog management, and OTP verification features.",
    "VERSION": "3.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api",
    "COMPONENT_SPLIT_REQUEST": True,
    "SORT_OPERATIONS": False,
    "AUTHENTICATION_WHITELIST": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "SERVERS": [
        {"url": "http://127.0.0.1:8000", "description": "Local development server"},
        {"url": os.environ.get("PRODUCTION_SERVER_URL"), "description": "Production server"},
    ],
    "TAGS": [
        {"name": "Authentication", "description": "User authentication and account management"},
        {"name": "Users APIs", "description": "User profile management"},
        {"name": "Blogs APIs", "description": "Blog creation and management"},
        {"name": "Public APIs", "description": "Public blog viewing endpoints"},
        {"name": "Comments APIs", "description": "Comment management and interactions"},
        {"name": "Likes APIs", "description": "Like management and interactions"},
    ],
    # Reduce OpenAPI warnings
    "DISABLE_ERRORS_AND_WARNINGS": True,  # This will suppress warnings
    "WARN_ON_MISSING_OPERATION_ID": False,
    "GENERIC_ADDITIONAL_PROPERTIES": "any",
    "ENUM_NAME_OVERRIDES": {},
    "POSTPROCESSING_HOOKS": [],
    # Better pagination support
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "displayOperationId": False,
        "defaultModelsExpandDepth": 1,
        "defaultModelExpandDepth": 1,
        "defaultModelRendering": "example",
        "displayRequestDuration": True,
        "docExpansion": "none",
        "filter": True,
        "showExtensions": True,
        "showCommonExtensions": True,
    },
    # Disable automatic example generation for specific cases
    "PREPROCESSING_HOOKS": [
        "drf_spectacular.hooks.preprocess_exclude_path_format",
    ],
}


# LOGGING OF PROJECT
month_year = timezone.now().strftime("%B_%Y")
today = timezone.now().strftime("%d_%m_%Y")
file_path = f"{BASE_DIR}/DEBUG_LOGS/{month_year}"
try:
    os.makedirs(file_path)
except FileExistsError:
    pass


APP_LOG_FILENAME = f"{file_path}/{today}.log"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {"format": "%(asctime)-8s %(levelname)-8s %(message)s"},
        "file": {"format": "%(asctime)s  %(levelname)-8s %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "console"},
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "formatter": "file",
            "filename": APP_LOG_FILENAME,
            "encoding": "utf-8",
        },
    },
    "loggers": {
        "": {"level": "INFO", "handlers": ["file", "console"]},
    },
}


# EMAIL BACKEND
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")

# Celery Configuration
CELERY_BROKER_URL = os.environ.get("REDIS_URL")
CELERY_RESULT_BACKEND = os.environ.get("REDIS_URL")
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True

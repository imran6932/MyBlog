"""
API Documentation and Schema Definitions
========================================

This module contains all OpenAPI schema definitions and documentation
for the blog API endpoints using drf-spectacular.
"""

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes


# Centralized OpenAPI examples for serializers

SIGNUP_EXAMPLES = [
    OpenApiExample(
        "User Registration",
        summary="Register a new user",
        description="Create a new user account with name, email, and password",
        value={
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "securepassword123",
        },
        request_only=True,
    ),
    OpenApiExample(
        "Registration Response",
        summary="Successful registration response",
        description="Response after successful user registration",
        value={"id": "1", "name": "John Doe", "email": "john.doe@example.com"},
        response_only=True,
    ),
]

LOGIN_EXAMPLES = [
    OpenApiExample(
        "User Login",
        summary="User login credentials",
        description="Email and password for user authentication",
        value={"email": "john.doe@example.com", "password": "securepassword123"},
        request_only=True,
    ),
]

PASSWORD_RESET_CONFIRM_EXAMPLES = [
    OpenApiExample(
        "Password Reset Confirm",
        summary="Password reset confirmation",
        description="New password confirmation for reset",
        value={
            "new_password1": "newsecurepassword123",
            "new_password2": "newsecurepassword123",
        },
        request_only=True,
    ),
]

USER_PROFILE_EXAMPLES = [
    OpenApiExample(
        "User Profile",
        summary="User profile information",
        description="Complete user profile data",
        value={
            "email": "john.doe@example.com",
            "name": "John Doe",
            "photo": "https://blog-api.imranansari.in/media/profile_photo/1_John_Doe/profile.jpg",
            "created_at": "2025-08-12T10:30:00Z",
        },
        response_only=True,
    ),
]

BLOG_POST_EXAMPLES = [
    OpenApiExample(
        "Blog Post",
        summary="Complete blog post information",
        description="Blog post with user information and content",
        value={
            "id": 1,
            "user": {
                "name": "John-Doe",
                "photo": "https://blog-api.imranansari.in/media/profile_photo/1_John_Doe/profile.jpg",
            },
            "title": "My-First-Blog-Post",
            "description": "<p>This is the content of my first blog post...</p>",
            "photo": "https://blog-api.imranansari.in/media/blogs_photo/1_John_Doe/blog_image.jpg",
            "status": 2,
            "created_at": "2025-08-12T15:30:00Z",
            "updated_at": "2025-08-12T15:30:00Z",
            "total_comments": 5,
            "total_likes": 12,
            "comments": [
                {
                    "comment_id": 1,
                    "comment_user": {"id": 2, "name": "Jane Doe"},
                    "content": "Great blog post!",
                    "parent_id": None,
                    "created_at": "2025-08-12T16:00:00Z",
                    "updated_at": "2025-08-12T16:00:00Z",
                    "comments_count": 1
                }
            ]
        },
        response_only=True,
    ),
]

CREATE_UPDATE_BLOG_EXAMPLES = [
    OpenApiExample(
        "Create Blog",
        summary="Create a new blog post",
        description="Data required to create a new blog post",
        value={
            "title": "My Amazing Blog Post",
            "description": "<p>This is the content of my blog post with <strong>rich text</strong> formatting.</p>",
            "status": 2,
        },
        request_only=True,
    ),
    OpenApiExample(
        "Update Blog",
        summary="Update an existing blog post",
        description="Data to update a blog post (all fields optional for partial update)",
        value={
            "title": "Updated Blog Post Title",
            "description": "<p>Updated content...</p>",
            "status": 1,
        },
        request_only=True,
    ),
]

UPDATE_PROFILE_EXAMPLES = [
    OpenApiExample(
        "Update Profile",
        summary="Update user profile",
        description="Data to update user profile information",
        value={
            "name": "John Smith",
            "email": "john.smith@example.com",
        },
        request_only=True,
    ),
]

PAGINATED_BLOG_RESPONSE_EXAMPLES = [
    OpenApiExample(
        "Paginated Blog Response",
        summary="Paginated blog response with metadata",
        description="Response structure for paginated blog endpoints",
        value={
            "data": [
                {
                    "id": 1,
                    "user": {
                        "name": "John-Doe",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                    },
                    "title": "My-Blog-Post",
                    "description": "<p>Blog content...</p>",
                    "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                    "status": 2,
                    "created_at": "2025-08-12T15:30:00Z",
                    "updated_at": "2025-08-12T15:30:00Z",
                    "total_comments": 3,
                    "total_likes": 8,
                    "comments": []
                }
            ],
            "pagination": {
                "current_page": 1,
                "total_pages": 5,
                "total_items": 47,
                "page_size": 10,
                "has_next": True,
                "has_previous": False,
                "next_page": 2,
                "previous_page": None,
            },
        },
        response_only=True,
    ),
]

# CommentView Schema Documentation
comment_view_post_schema = extend_schema(
    summary="Create a new comment",
    description="Add a comment to a blog post or reply to an existing comment",
    tags=["Comments APIs"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "blog": {"type": "integer", "description": "ID of the blog post"},
                "content": {"type": "string", "description": "Comment content"},
                "parent_id": {"type": "integer", "nullable": True, "description": "ID of parent comment for replies"},
            },
            "required": ["blog", "content"]
        }
    },
    responses={
        201: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "data": {"$ref": "#/components/schemas/Comment"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Create Comment",
            summary="Create a new comment",
            description="Add a comment to a blog post",
            value={
                "blog": 1,
                "content": "This is a great blog post!",
                "parent_id": None
            },
            request_only=True,
        ),
        OpenApiExample(
            "Comment Created Response",
            summary="Successful comment creation",
            description="Response after creating a comment",
            value={
                "message": "Comment created successfully",
                "data": {
                    "comment_id": 1,
                    "comment_user": {"id": 2, "name": "John Doe"},
                    "blog_id": 1,
                    "content": "This is a great blog post!",
                    "parent_id": None,
                    "created_at": "2025-08-23T10:00:00Z",
                    "updated_at": "2025-08-23T10:00:00Z",
                    "comments_count": 0,
                    "comments": []
                }
            },
            response_only=True,
        )
    ]
)

comment_view_get_schema = extend_schema(
    summary="Retrieve a comment",
    description="Retrieve a specific comment by its ID",
    tags=["Comments APIs"],
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="ID of the comment to retrieve",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "array",
            "items": {"$ref": "#/components/schemas/Comment"}
        }
    }
)

comment_view_put_schema = extend_schema(
    summary="Update a comment",
    description="Update an existing comment (only by the comment author)",
    tags=["Comments APIs"],
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the comment to update",
            required=True
        ),
    ],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Updated comment content"},
            },
            "required": ["content"]
        }
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "data": {"$ref": "#/components/schemas/Comment"}
            }
        }
    }
)

comment_view_delete_schema = extend_schema(
    summary="Delete a comment",
    description="Delete an existing comment (only by the comment author)",
    tags=["Comments APIs"],
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the comment to delete",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

# BlogAllCommentsView Schema Documentation
blog_all_comments_view_schema = extend_schema(
    summary="Get all comments for a blog with pagination",
    description="Retrieve paginated list of all comments for a specific blog post",
    tags=["Comments APIs"],
    parameters=[
        OpenApiParameter(
            name="blog_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the blog post",
            required=True
        ),
        OpenApiParameter(
            name="page",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Page number (default: 1)",
            required=False
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "comments": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/Comment"}
                },
                "pagination": {
                    "type": "object",
                    "properties": {
                        "current_page": {"type": "integer"},
                        "total_pages": {"type": "integer"},
                        "total_comments": {"type": "integer"},
                        "has_next": {"type": "boolean"},
                        "has_previous": {"type": "boolean"}
                    }
                }
            }
        }
    }
)

# LikeView Schema Documentation
like_view_post_schema = extend_schema(
    summary="Like or unlike a blog post",
    description="Toggle like status for a blog post",
    tags=["Likes APIs"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "blog_id": {"type": "integer", "description": "ID of the blog post to like/unlike"},
            },
            "required": ["blog_id"]
        }
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "liked": {"type": "boolean", "description": "Whether the blog is now liked"},
                "total_likes": {"type": "integer", "description": "Total number of likes for the blog"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Like Blog",
            summary="Like a blog post",
            description="Add a like to a blog post",
            value={
                "blog_id": 1
            },
            request_only=True,
        ),
        OpenApiExample(
            "Like Response",
            summary="Response for liking/unliking a blog",
            description="Details of the like action",
            value={
                "message": "Blog liked successfully",
                "liked": True,
                "total_likes": 15
            },
            response_only=True,
        )
    ]
)

like_view_get_schema = extend_schema(
    summary="Get users who liked a blog post",
    description="Retrieve all users who have liked a specific blog post",
    tags=["Likes APIs"],
    parameters=[
        OpenApiParameter(
            name="blog_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="ID of the blog post to get likes for",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "data": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/User"}
                }
            }
        },
        404: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Blog Likes Response",
            summary="Users who liked the blog",
            description="List of users who have liked the blog post",
            value={
                "data": [
                    {
                        "id": 1,
                        "name": "John Doe",
                        "email": "john.doe@example.com",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                        "created_at": "2025-08-12T10:30:00Z"
                    },
                    {
                        "id": 2,
                        "name": "Jane Smith",
                        "email": "jane.smith@example.com",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/jane.jpg",
                        "created_at": "2025-08-15T14:20:00Z"
                    }
                ]
            },
            response_only=True,
        )
    ]
)

# UserBlogView Schema Documentation
user_blog_view_get_schema = extend_schema(
    operation_id="user_blog_list",
    summary="Get user's blog posts",
    description="Retrieve paginated list of user's blog posts with optional status filtering",
    tags=["Blogs APIs"],
    parameters=[
        OpenApiParameter(
            name="page",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Page number (default: 1)",
            required=False
        ),
        OpenApiParameter(
            name="page_size",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Number of items per page (default: 10, max: 100)",
            required=False
        ),
        OpenApiParameter(
            name="status",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Filter by blog status (2=Published, 3=Archived, 4=Rejected)",
            required=False
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "pagination": {
                    "type": "object",
                    "properties": {
                        "total_count": {"type": "integer", "example": 25},
                        "current_page": {"type": "integer", "example": 1},
                        "total_pages": {"type": "integer", "example": 3},
                        "total_items": {"type": "integer", "example": 25},
                        "page_size": {"type": "integer", "example": 10},
                        "next_page": {"type": "integer", "nullable": True, "example": 2},
                        "previous_page": {"type": "integer", "nullable": True, "example": None},
                        "has_next": {"type": "boolean", "example": True},
                        "has_previous": {"type": "boolean", "example": False}
                    }
                },
                "data": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/Blog"}
                }
            }
        }
    },
    examples=[
        OpenApiExample(
            "Paginated User Blogs",
            summary="User's paginated blogs with filtering",
            description="Response with user's blog data, pagination info, and filter metadata",
            value={
                "pagination": {
                    "total_count": 25,
                    "current_page": 1,
                    "total_pages": 3,
                    "total_items": 25,
                    "page_size": 10,
                    "next_page": 2,
                    "previous_page": None,
                    "has_next": True,
                    "has_previous": False
                },
                "data": [
                    {
                        "id": 1,
                        "user": {
                            "email": "john.doe@example.com",
                            "name": "John Doe",
                            "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                            "created_at": "2025-08-12T10:30:00Z"
                        },
                        "title": "My First Blog Post",
                        "description": "<p>This is the content of my first blog post...</p>",
                        "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                        "status": 2,
                        "created_at": "2025-08-12T15:30:00Z",
                        "updated_at": "2025-08-12T15:30:00Z"
                    }
                ],
                "pagination": {
                    "current_page": 1,
                    "total_pages": 3,
                    "total_items": 25,
                    "page_size": 10,
                    "has_next": True,
                    "has_previous": False,
                    "next_page": 2,
                    "previous_page": None
                },
                "filter_applied": {
                    "status": "2",
                    "status_name": "Published"
                }
            },
            response_only=True
        )
    ]
)

user_blog_view_detail_schema = extend_schema(
    operation_id="user_blog_detail",
    summary="Get user's blog post detail",
    description="Retrieve detailed information about a specific user's blog post",
    tags=["Blogs APIs"],
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the blog post to retrieve",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "data": {"$ref": "#/components/schemas/Blog"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Single User Blog Post",
            summary="Detailed user blog post information",
            description="Complete information about a single user's blog post",
            value={
                "data": {
                    "id": 1,
                    "user": {
                        "email": "john.doe@example.com",
                        "name": "John Doe",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                        "created_at": "2025-08-12T10:30:00Z"
                    },
                    "title": "My Blog Post",
                    "description": "<p>This is my blog post content...</p>",
                    "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                    "status": 2,
                    "created_at": "2025-08-12T15:30:00Z",
                    "updated_at": "2025-08-12T15:30:00Z",
                    "total_comments": 12,
                    "total_likes": 25,
                    "comments": [
                        {
                            "comment_id": 1,
                            "comment_user": {
                                "id": 2,
                                "name": "Jane Doe"
                            },
                            "content": "Great blog post!",
                            "parent_id": None,
                            "created_at": "2025-08-12T16:00:00Z",
                            "updated_at": "2025-08-12T16:00:00Z",
                            "comments_count": 1
                        }
                    ]
                }
            },
            response_only=True
        )
    ]
)

user_blog_view_post_schema = extend_schema(
    operation_id="user_blog_create",
    summary="Create a new blog post",
    description="Create a new blog post that will be submitted for review",
    tags=["Blogs APIs"],
    responses={
        201: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "data": {"$ref": "#/components/schemas/Blog"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Blog Creation Success",
            summary="Successful blog creation",
            description="Blog created and submitted for review",
            value={
                "message": "blog has created and review in progress",
                "data": {
                    "id": 1,
                    "user": {
                        "email": "john.doe@example.com",
                        "name": "John Doe",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                        "created_at": "2025-08-12T10:30:00Z"
                    },
                    "title": "My New Blog Post",
                    "description": "<p>This is my new blog post content...</p>",
                    "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                    "status": 1,
                    "created_at": "2025-08-12T15:30:00Z",
                    "updated_at": "2025-08-12T15:30:00Z"
                }
            },
            response_only=True
        )
    ]
)

user_blog_view_patch_schema = extend_schema(
    operation_id="user_blog_update",
    summary="Update a blog post",
    description="Update an existing blog post and resubmit for review",
    tags=["Blogs APIs"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "data": {"$ref": "#/components/schemas/Blog"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Blog Update Success",
            summary="Successful blog update",
            description="Blog updated and resubmitted for review",
            value={
                "message": "blog updated and review in progress",
                "data": {
                    "id": 1,
                    "user": {
                        "email": "john.doe@example.com",
                        "name": "John Doe",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                        "created_at": "2025-08-12T10:30:00Z"
                    },
                    "title": "My Updated Blog Post",
                    "description": "<p>This is my updated blog post content...</p>",
                    "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                    "status": 1,
                    "created_at": "2025-08-12T15:30:00Z",
                    "updated_at": "2025-08-12T16:45:00Z"
                }
            },
            response_only=True
        )
    ]
)

user_blog_view_delete_schema = extend_schema(
    operation_id="user_blog_delete",
    summary="Delete a blog post",
    description="Delete an existing published blog post",
    tags=["Blogs APIs"],
    responses={
        204: {"description": "Blog post deleted successfully"},
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

# AllBlogView Schema Documentation
all_blog_view_list_schema = extend_schema(
    operation_id="all_blog_list",
    summary="Get all published blog posts",
    description="Retrieve paginated list of all published blog posts",
    tags=["Public APIs"],
    parameters=[
        OpenApiParameter(
            name="page",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Page number (default: 1)",
            required=False
        ),
        OpenApiParameter(
            name="page_size",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Number of items per page (default: 10, max: 100)",
            required=False
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "pagination": {
                    "type": "object",
                    "properties": {
                        "total_count": {"type": "integer", "example": 50},
                        "current_page": {"type": "integer", "example": 1},
                        "total_pages": {"type": "integer", "example": 5},
                        "total_items": {"type": "integer", "example": 50},
                        "page_size": {"type": "integer", "example": 10},
                        "next_page": {"type": "integer", "nullable": True, "example": 2},
                        "previous_page": {"type": "integer", "nullable": True, "example": None},
                        "has_next": {"type": "boolean", "example": True},
                        "has_previous": {"type": "boolean", "example": False}
                    }
                },
                "data": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/Blog"}
                }
            }
        }
    },
    examples=[
        OpenApiExample(
            "Paginated Public Blogs",
            summary="Paginated public blog posts",
            description="Response with published blog data and pagination information",
            value={
                "pagination": {
                    "total_count": 50,
                    "current_page": 1,
                    "total_pages": 5,
                    "total_items": 50,
                    "page_size": 10,
                    "next_page": 2,
                    "previous_page": None,
                    "has_next": True,
                    "has_previous": False
                },
                "data": [
                    {
                        "id": 1,
                        "user": {
                            "email": "john.doe@example.com",
                            "name": "John Doe",
                            "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                            "created_at": "2025-08-12T10:30:00Z"
                        },
                        "title": "Public Blog Post",
                        "description": "<p>This is a published blog post visible to everyone...</p>",
                        "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                        "status": 2,
                        "created_at": "2025-08-12T15:30:00Z",
                        "updated_at": "2025-08-12T15:30:00Z"
                    }
                ],
                "pagination": {
                    "current_page": 1,
                    "total_pages": 5,
                    "total_items": 47,
                    "page_size": 10,
                    "has_next": True,
                    "has_previous": False,
                    "next_page": 2,
                    "previous_page": None
                }
            },
            response_only=True
        )
    ]
)

all_blog_view_detail_schema = extend_schema(
    operation_id="all_blog_detail",
    summary="Get a single published blog post",
    description="Retrieve detailed information about a specific published blog post",
    tags=["Public APIs"],
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="ID of the blog post to retrieve",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "data": {"$ref": "#/components/schemas/Blog"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        },
        404: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Single Blog Post",
            summary="Detailed blog post information",
            description="Complete information about a single published blog post",
            value={
                "data": {
                    "id": 1,
                    "user": {
                        "email": "john.doe@example.com",
                        "name": "John Doe",
                        "photo": "https://blog-api.imranansari.in/media/profile_photo/john.jpg",
                        "created_at": "2025-08-12T10:30:00Z"
                    },
                    "title": "Public Blog Post",
                    "description": "<p>This is a published blog post visible to everyone...</p>",
                    "photo": "https://blog-api.imranansari.in/media/blogs_photo/blog1.jpg",
                    "status": 2,
                    "created_at": "2025-08-12T15:30:00Z",
                    "updated_at": "2025-08-12T15:30:00Z",
                    "total_comments": 12,
                    "total_likes": 25,
                    "comments": [
                        {
                            "comment_id": 1,
                            "comment_user": {"id": 2, "name": "Jane Doe"},
                            "content": "Great blog post!",
                            "parent_id": None,
                            "created_at": "2025-08-12T16:00:00Z",
                            "updated_at": "2025-08-12T16:00:00Z",
                            "comments_count": 1
                        }
                    ]
                }
            },
            response_only=True
        )
    ]
)

# User Authentication Schema Documentation
user_signup_schema = extend_schema(
    summary="User Registration",
    description="Register a new user account",
    tags=["Authentication"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "data": {"$ref": "#/components/schemas/User"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=SIGNUP_EXAMPLES
)

user_login_schema = extend_schema(
    summary="User Login",
    description="Authenticate user and return access token",
    tags=["Authentication"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "data": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"},
                        "user": {"type": "string"},
                        "email": {"type": "string"},
                        "access_token": {"type": "string"}
                    }
                }
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "email": {"type": "string"}
            }
        }
    },
    examples=[
        OpenApiExample(
            "Successful Login",
            summary="User logged in successfully",
            description="Authentication successful with JWT token",
            value={
                "data": {
                    "id": 1,
                    "user": "John-Doe",
                    "email": "john.doe@example.com",
                    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
                }
            },
            response_only=True
        )
    ]
)

# OTP Schema Documentation
generate_otp_schema = extend_schema(
    summary="Generate OTP",
    description="Generate and send OTP to user's email for verification",
    tags=["Authentication"],
    parameters=[
        OpenApiParameter(
            name="email",
            type=OpenApiTypes.EMAIL,
            location=OpenApiParameter.QUERY,
            description="User's email address",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "email": {"type": "string"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "email": {"type": "string"}
            }
        },
        404: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

verify_otp_schema = extend_schema(
    summary="Verify OTP",
    description="Verify OTP and activate user account",
    tags=["Authentication"],
    parameters=[
        OpenApiParameter(
            name="email",
            type=OpenApiTypes.EMAIL,
            location=OpenApiParameter.QUERY,
            description="User's email address",
            required=True
        ),
        OpenApiParameter(
            name="otp",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="6-digit OTP code",
            required=True
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "access_token": {"type": "string"},
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "email": {"type": "string"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

# Password Reset Schema Documentation
password_reset_schema = extend_schema(
    summary="Request Password Reset",
    description="Send password reset OTP to user's email",
    tags=["Authentication"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "email": {"type": "string"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

password_reset_confirm_schema = extend_schema(
    summary="Confirm Password Reset",
    description="Verify OTP and set new password",
    tags=["Authentication"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    examples=PASSWORD_RESET_CONFIRM_EXAMPLES
)

change_password_schema = extend_schema(
    summary="Change Password",
    description="Change user's password (requires authentication)",
    tags=["Authentication"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

# Profile Schema Documentation
profile_get_schema = extend_schema(
    summary="Get User Profile",
    description="Retrieve authenticated user's profile information",
    tags=["Users APIs"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "data": {"$ref": "#/components/schemas/User"}
            }
        }
    }
)

profile_patch_schema = extend_schema(
    summary="Update User Profile",
    description="Update authenticated user's profile information",
    tags=["Users APIs"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "data": {"$ref": "#/components/schemas/UserUpdate"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        }
    }
)

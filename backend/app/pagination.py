"""
Custom pagination classes for the blog application.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that provides consistent pagination response format
    across all API endpoints while maintaining backward compatibility.
    """
    
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'
    
    # Add OpenAPI examples for better documentation
    page_size_query_description = "Number of results per page (default: 10, max: 100)"
    page_query_description = "Page number to retrieve (default: 1)"

    def get_paginated_response(self, data):
        """
        Return paginated response with custom format that matches existing API structure.
        """
        return Response(OrderedDict([
            ('pagination', OrderedDict([
                ('total_count', self.page.paginator.count),
                ('current_page', self.page.number),
                ('total_pages', self.page.paginator.num_pages),
                ('total_items', self.page.paginator.count),
                ('page_size', self.page_size),
                ('next_page', self.page.next_page_number() if self.page.has_next() else None),
                ('previous_page', self.page.previous_page_number() if self.page.has_previous() else None),
                ('has_next', self.page.has_next()),
                ('has_previous', self.page.has_previous()),
            ])),
            ('data', data)  # Keep 'data' for backward compatibility
        ]))

    def get_paginated_response_schema(self, schema):
        """
        Return paginated response schema for API documentation with proper examples.
        """
        return {
            'type': 'object',
            'required': ['pagination', 'data'],
            'properties': {
                'pagination': {
                    'type': 'object',
                    'required': ['total_count', 'current_page', 'total_pages', 'page_size', 'has_next', 'has_previous'],
                    'properties': {
                        'total_count': {
                            'type': 'integer',
                            'example': 100,
                            'description': 'Total number of items across all pages'
                        },
                        'current_page': {
                            'type': 'integer',
                            'example': 1,
                            'minimum': 1,
                            'description': 'Current page number'
                        },
                        'total_pages': {
                            'type': 'integer',
                            'example': 10,
                            'minimum': 1,
                            'description': 'Total number of pages'
                        },
                        'total_items': {
                            'type': 'integer',
                            'example': 100,
                            'minimum': 0,
                            'description': 'Total number of items (same as total_count)'
                        },
                        'page_size': {
                            'type': 'integer',
                            'example': 10,
                            'minimum': 1,
                            'maximum': 100,
                            'description': 'Number of items per page'
                        },
                        'next_page': {
                            'type': 'integer',
                            'nullable': True,
                            'example': 2,
                            'minimum': 1,
                            'description': 'Next page number (null if no next page)'
                        },
                        'previous_page': {
                            'type': 'integer',
                            'nullable': True,
                            'example': None,
                            'minimum': 1,
                            'description': 'Previous page number (null if no previous page)'
                        },
                        'has_next': {
                            'type': 'boolean',
                            'example': True,
                            'description': 'Whether there is a next page'
                        },
                        'has_previous': {
                            'type': 'boolean',
                            'example': False,
                            'description': 'Whether there is a previous page'
                        },
                    },
                    'example': {
                        'total_count': 100,
                        'current_page': 1,
                        'total_pages': 10,
                        'total_items': 100,
                        'page_size': 10,
                        'next_page': 2,
                        'previous_page': None,
                        'has_next': True,
                        'has_previous': False
                    }
                },
                'data': {
                    'type': 'array',
                    'items': schema,
                    'description': 'Array of paginated items'
                }
            },
            'example': {
                'pagination': {
                    'total_count': 100,
                    'current_page': 1,
                    'total_pages': 10,
                    'total_items': 100,
                    'page_size': 10,
                    'next_page': 2,
                    'previous_page': None,
                    'has_next': True,
                    'has_previous': False
                },
                'data': []
            }
        }


class CommentPagination(PageNumberPagination):
    """
    Custom pagination class specifically for comments with OpenAPI support.
    """
    
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    page_query_param = 'page'
    
    # Add OpenAPI examples for better documentation
    page_size_query_description = "Number of comments per page (default: 10, max: 50)"
    page_query_description = "Page number to retrieve (default: 1)"

    def get_paginated_response(self, data):
        """
        Return paginated response for comments with custom format.
        """
        return Response(OrderedDict([
            ('comments', data),
            ('pagination', OrderedDict([
                ('total_count', self.page.paginator.count),
                ('current_page', self.page.number),
                ('total_pages', self.page.paginator.num_pages),
                ('page_size', self.page_size),
                ('has_next', self.page.has_next()),
                ('has_previous', self.page.has_previous()),
                ('next_page', self.page.next_page_number() if self.page.has_next() else None),
                ('previous_page', self.page.previous_page_number() if self.page.has_previous() else None),
            ]))
        ]))

    def get_paginated_response_schema(self, schema):
        """
        Return paginated response schema for comments with proper examples.
        """
        return {
            'type': 'object',
            'required': ['comments', 'pagination'],
            'properties': {
                'comments': {
                    'type': 'array',
                    'items': schema,
                    'description': 'Array of paginated comments'
                },
                'pagination': {
                    'type': 'object',
                    'required': ['total_count', 'current_page', 'total_pages', 'page_size', 'has_next', 'has_previous'],
                    'properties': {
                        'total_count': {
                            'type': 'integer',
                            'example': 50,
                            'minimum': 0,
                            'description': 'Total number of comments'
                        },
                        'current_page': {
                            'type': 'integer',
                            'example': 1,
                            'minimum': 1,
                            'description': 'Current page number'
                        },
                        'total_pages': {
                            'type': 'integer',
                            'example': 5,
                            'minimum': 1,
                            'description': 'Total number of pages'
                        },
                        'page_size': {
                            'type': 'integer',
                            'example': 10,
                            'minimum': 1,
                            'maximum': 50,
                            'description': 'Number of comments per page'
                        },
                        'has_next': {
                            'type': 'boolean',
                            'example': True,
                            'description': 'Whether there is a next page'
                        },
                        'has_previous': {
                            'type': 'boolean',
                            'example': False,
                            'description': 'Whether there is a previous page'
                        },
                        'next_page': {
                            'type': 'integer',
                            'nullable': True,
                            'example': 2,
                            'minimum': 1,
                            'description': 'Next page number (null if no next page)'
                        },
                        'previous_page': {
                            'type': 'integer',
                            'nullable': True,
                            'example': None,
                            'minimum': 1,
                            'description': 'Previous page number (null if no previous page)'
                        },
                    },
                    'example': {
                        'total_count': 50,
                        'current_page': 1,
                        'total_pages': 5,
                        'page_size': 10,
                        'has_next': True,
                        'has_previous': False,
                        'next_page': 2,
                        'previous_page': None
                    }
                }
            },
            'example': {
                'comments': [],
                'pagination': {
                    'total_count': 50,
                    'current_page': 1,
                    'total_pages': 5,
                    'page_size': 10,
                    'has_next': True,
                    'has_previous': False,
                    'next_page': 2,
                    'previous_page': None
                }
            }
        }

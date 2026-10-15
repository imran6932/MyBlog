"""
Django management command for cache operations.

Usage:
    python manage.py cache_operations --clear-all
    python manage.py cache_operations --delete-user 123
    python manage.py cache_operations --delete-blog 456
    python manage.py cache_operations --delete-pattern "user_blog_*"
    python manage.py cache_operations --list-keys "*blog*"
    python manage.py cache_operations --stats
"""

from django.core.management.base import BaseCommand, CommandError
from app.redis import RedisCache
import json


class Command(BaseCommand):
    help = 'Manage Redis cache operations for the blog application'

    def add_arguments(self, parser):
        # Cache deletion options
        parser.add_argument(
            '--clear-all',
            action='store_true',
            help='Clear all cache data (WARNING: This deletes everything!)'
        )
        
        parser.add_argument(
            '--delete-user',
            type=int,
            help='Delete all cache entries for a specific user ID'
        )
        
        parser.add_argument(
            '--delete-blog',
            type=int,
            help='Delete all cache entries for a specific blog ID'
        )
        
        parser.add_argument(
            '--delete-pattern',
            type=str,
            help='Delete cache entries matching a pattern (supports wildcards)'
        )
        
        parser.add_argument(
            '--delete-key',
            type=str,
            help='Delete a specific cache key'
        )
        
        # Cache inspection options
        parser.add_argument(
            '--list-keys',
            type=str,
            nargs='?',
            const='*',
            help='List all cache keys matching a pattern (default: all keys)'
        )
        
        parser.add_argument(
            '--stats',
            action='store_true',
            help='Show cache statistics and health information'
        )
        
        parser.add_argument(
            '--health-check',
            action='store_true',
            help='Perform a cache health check'
        )
        
        # Output options
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output'
        )

    def handle(self, *args, **options):
        verbosity = options.get('verbosity', 1)
        verbose = options.get('verbose', False)
        
        try:
            # Clear all cache
            if options['clear_all']:
                self.handle_clear_all(verbose)
            
            # Delete user cache
            elif options['delete_user']:
                self.handle_delete_user(options['delete_user'], verbose)
            
            # Delete blog cache
            elif options['delete_blog']:
                self.handle_delete_blog(options['delete_blog'], verbose)
            
            # Delete by pattern
            elif options['delete_pattern']:
                self.handle_delete_pattern(options['delete_pattern'], verbose)
            
            # Delete specific key
            elif options['delete_key']:
                self.handle_delete_key(options['delete_key'], verbose)
            
            # List keys
            elif options['list_keys'] is not None:
                self.handle_list_keys(options['list_keys'], verbose)
            
            # Show stats
            elif options['stats']:
                self.handle_stats(verbose)
            
            # Health check
            elif options['health_check']:
                self.handle_health_check(verbose)
            
            else:
                self.stdout.write(
                    self.style.WARNING('No operation specified. Use --help for available options.')
                )
                
        except Exception as e:
            raise CommandError(f'Cache operation failed: {str(e)}')

    def handle_clear_all(self, verbose):
        """Clear all cache data"""
        self.stdout.write(
            self.style.WARNING('⚠️  This will delete ALL cache data!')
        )
        
        confirm = input('Are you sure? Type "yes" to confirm: ')
        if confirm.lower() == 'yes':
            success = RedisCache.clear_all_cache()
            if success:
                self.stdout.write(
                    self.style.SUCCESS('✅ Successfully cleared all cache data')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Failed to clear cache data')
                )
        else:
            self.stdout.write(
                self.style.WARNING('Operation cancelled')
            )

    def handle_delete_user(self, user_id, verbose):
        """Delete user-specific cache"""
        if verbose:
            self.stdout.write(f'Deleting cache for user ID: {user_id}')
        
        deleted_count = RedisCache.delete_user_cache(user_id)
        
        if deleted_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Deleted {deleted_count} cache entries for user {user_id}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'No cache entries found for user {user_id}')
            )

    def handle_delete_blog(self, blog_id, verbose):
        """Delete blog-specific cache"""
        if verbose:
            self.stdout.write(f'Deleting cache for blog ID: {blog_id}')
        
        deleted_count = RedisCache.delete_blog_cache(blog_id)
        
        if deleted_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Deleted {deleted_count} cache entries for blog {blog_id}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'No cache entries found for blog {blog_id}')
            )

    def handle_delete_pattern(self, pattern, verbose):
        """Delete cache entries by pattern"""
        if verbose:
            self.stdout.write(f'Deleting cache entries matching pattern: {pattern}')
        
        deleted_count = RedisCache.invalidate_cache_pattern(pattern)
        
        if deleted_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Deleted {deleted_count} cache entries matching pattern "{pattern}"')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'No cache entries found matching pattern "{pattern}"')
            )

    def handle_delete_key(self, cache_key, verbose):
        """Delete a specific cache key"""
        if verbose:
            self.stdout.write(f'Deleting cache key: {cache_key}')
        
        success = RedisCache.delete_cached_data(cache_key)
        
        if success:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully deleted cache key: {cache_key}')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to delete cache key: {cache_key}')
            )

    def handle_list_keys(self, pattern, verbose):
        """List cache keys matching pattern"""
        if verbose:
            self.stdout.write(f'Listing cache keys matching pattern: {pattern}')
        
        keys = RedisCache.get_all_cache_keys(pattern)
        
        if keys:
            self.stdout.write(
                self.style.SUCCESS(f'Found {len(keys)} cache keys:')
            )
            for key in sorted(keys):
                self.stdout.write(f'  • {key}')
        else:
            self.stdout.write(
                self.style.WARNING(f'No cache keys found matching pattern "{pattern}"')
            )

    def handle_stats(self, verbose):
        """Show cache statistics"""
        stats = RedisCache.get_cache_stats()
        
        if 'error' in stats:
            self.stdout.write(
                self.style.ERROR(f'❌ Error getting cache stats: {stats["error"]}')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS('📊 Cache Statistics:')
        )
        
        for key, value in stats.items():
            self.stdout.write(f'  • {key.replace("_", " ").title()}: {value}')

    def handle_health_check(self, verbose):
        """Perform cache health check"""
        if verbose:
            self.stdout.write('Performing cache health check...')
        
        is_healthy = RedisCache.health_check()
        
        if is_healthy:
            self.stdout.write(
                self.style.SUCCESS('✅ Cache is healthy and working properly')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Cache health check failed')
            )

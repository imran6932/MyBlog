"""
Django management command for Redis cache operations
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from app.redis import RedisCache
import json


class Command(BaseCommand):
    help = 'Manage Redis cache operations'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['stats', 'health', 'clear', 'clear-pattern'],
            help='Action to perform'
        )
        parser.add_argument(
            '--pattern',
            type=str,
            help='Pattern for clear-pattern action'
        )
        parser.add_argument(
            '--format',
            choices=['json', 'table'],
            default='table',
            help='Output format for stats'
        )

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'stats':
            self.show_stats(options['format'])
        elif action == 'health':
            self.check_health()
        elif action == 'clear':
            self.clear_cache()
        elif action == 'clear-pattern':
            pattern = options.get('pattern')
            if not pattern:
                self.stdout.write(
                    self.style.ERROR('--pattern is required for clear-pattern action')
                )
                return
            self.clear_pattern(pattern)

    def show_stats(self, format_type):
        """Show cache statistics"""
        try:
            stats = RedisCache.get_cache_stats()
            
            if 'error' in stats:
                self.stdout.write(
                    self.style.ERROR(f'Error getting stats: {stats["error"]}')
                )
                return
            
            if format_type == 'json':
                self.stdout.write(json.dumps(stats, indent=2))
            else:
                self.stdout.write(self.style.SUCCESS('Redis Cache Statistics:'))
                self.stdout.write(f"Redis Version: {stats.get('redis_version', 'Unknown')}")
                self.stdout.write(f"Connected Clients: {stats.get('connected_clients', 0)}")
                self.stdout.write(f"Used Memory: {stats.get('used_memory_human', 'Unknown')}")
                self.stdout.write(f"Keyspace Hits: {stats.get('keyspace_hits', 0)}")
                self.stdout.write(f"Keyspace Misses: {stats.get('keyspace_misses', 0)}")
                self.stdout.write(f"Total Commands: {stats.get('total_commands_processed', 0)}")
                
                # Calculate hit ratio
                hits = stats.get('keyspace_hits', 0)
                misses = stats.get('keyspace_misses', 0)
                total = hits + misses
                if total > 0:
                    hit_ratio = (hits / total) * 100
                    self.stdout.write(f"Hit Ratio: {hit_ratio:.2f}%")
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error retrieving cache stats: {str(e)}')
            )

    def check_health(self):
        """Check cache health"""
        try:
            if RedisCache.health_check():
                self.stdout.write(
                    self.style.SUCCESS('✓ Redis cache is healthy')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Redis cache health check failed')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Health check error: {str(e)}')
            )

    def clear_cache(self):
        """Clear all cache"""
        try:
            from django.core.cache import cache
            cache.clear()
            self.stdout.write(
                self.style.SUCCESS('✓ All cache cleared successfully')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error clearing cache: {str(e)}')
            )

    def clear_pattern(self, pattern):
        """Clear cache by pattern"""
        try:
            count = RedisCache.invalidate_cache_pattern(pattern)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Cleared {count} cache keys matching pattern: {pattern}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error clearing cache pattern: {str(e)}')
            )

"""
Health check views for monitoring application services
"""
import logging
from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.db import connection
from django.core.cache import cache
from app.redis import RedisCache

logger = logging.getLogger(__name__)


class HealthCheckView(View):
    """
    Health check endpoint for monitoring application health
    """
    
    def get(self, request):
        """
        Return health status of various application components
        """
        health_status = {
            'status': 'healthy',
            'version': getattr(settings, 'VERSION', '1.0.0'),
            'timestamp': self.get_timestamp(),
            'checks': {}
        }
        
        # Database health check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status['checks']['database'] = {
                'status': 'healthy',
                'message': 'Database connection successful'
            }
        except Exception as e:
            health_status['checks']['database'] = {
                'status': 'unhealthy',
                'message': f'Database connection failed: {str(e)}'
            }
            health_status['status'] = 'unhealthy'
        
        # Redis cache health check
        try:
            if RedisCache.health_check():
                health_status['checks']['cache'] = {
                    'status': 'healthy',
                    'message': 'Redis cache is working'
                }
            else:
                health_status['checks']['cache'] = {
                    'status': 'unhealthy',
                    'message': 'Redis cache health check failed'
                }
                health_status['status'] = 'degraded'  # Cache failure is not critical
        except Exception as e:
            health_status['checks']['cache'] = {
                'status': 'unhealthy',
                'message': f'Cache error: {str(e)}'
            }
            health_status['status'] = 'degraded'
        
        # Determine HTTP status code
        if health_status['status'] == 'healthy':
            status_code = 200
        elif health_status['status'] == 'degraded':
            status_code = 200  # Still operational
        else:
            status_code = 503  # Service unavailable
        
        return JsonResponse(health_status, status=status_code)
    
    def get_timestamp(self):
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


class CacheStatsView(View):
    """
    Cache statistics endpoint for monitoring
    """
    
    def get(self, request):
        """
        Return cache statistics
        """
        try:
            stats = RedisCache.get_cache_stats()
            
            if 'error' in stats:
                return JsonResponse({
                    'error': 'Failed to get cache stats',
                    'message': stats['error']
                }, status=500)
            
            # Add calculated metrics
            hits = stats.get('keyspace_hits', 0)
            misses = stats.get('keyspace_misses', 0)
            total = hits + misses
            
            if total > 0:
                stats['hit_ratio'] = (hits / total) * 100
            else:
                stats['hit_ratio'] = 0
            
            return JsonResponse({
                'cache_stats': stats,
                'timestamp': self.get_timestamp()
            })
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return JsonResponse({
                'error': 'Failed to get cache stats',
                'message': str(e)
            }, status=500)
    
    def get_timestamp(self):
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


class CacheManagementView(View):
    """
    Cache management endpoint for operations
    """
    
    def post(self, request):
        """
        Perform cache operations
        """
        try:
            import json
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'clear_all':
                cache.clear()
                return JsonResponse({
                    'message': 'All cache cleared successfully',
                    'timestamp': self.get_timestamp()
                })
            
            elif action == 'clear_pattern':
                pattern = data.get('pattern')
                if not pattern:
                    return JsonResponse({
                        'error': 'Pattern is required for clear_pattern action'
                    }, status=400)
                
                count = RedisCache.invalidate_cache_pattern(pattern)
                return JsonResponse({
                    'message': f'Cleared {count} cache keys matching pattern: {pattern}',
                    'cleared_count': count,
                    'timestamp': self.get_timestamp()
                })
            
            elif action == 'health_check':
                is_healthy = RedisCache.health_check()
                return JsonResponse({
                    'healthy': is_healthy,
                    'timestamp': self.get_timestamp()
                })
            
            else:
                return JsonResponse({
                    'error': 'Invalid action',
                    'valid_actions': ['clear_all', 'clear_pattern', 'health_check']
                }, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            logger.error(f"Error in cache management: {str(e)}")
            return JsonResponse({
                'error': 'Cache operation failed',
                'message': str(e)
            }, status=500)
    
    def get_timestamp(self):
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'

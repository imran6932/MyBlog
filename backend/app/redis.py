"""
Redis Cache Utilities for Blog Application

This module provides production-ready Redis caching utilities with proper
error handling, logging, and configuration management.
"""

import hashlib
import json
import logging
from typing import Any, Optional, Dict, List
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)


class RedisCache:
    """
    Production-ready Redis cache manager with comprehensive error handling
    and logging capabilities.
    """
    
    DEFAULT_TIMEOUT = 60 * 60 * 24  # 24 hours in seconds
    KEY_PREFIX = getattr(settings, 'CACHE_KEY_PREFIX', 'blog_app')
    
    @classmethod
    def generate_cache_key(cls, prefix: str, **kwargs) -> str:
        """
        Generate a unique cache key based on prefix and parameters.
        
        Args:
            prefix (str): The cache key prefix (e.g., 'user_blog_list')
            **kwargs: Key-value pairs to include in the cache key
            
        Returns:
            str: A unique cache key
            
        Example:
            >>> RedisCache.generate_cache_key('user_blog_list', user_id=123, page=1)
            'blog_app:user_blog_list:hash_abc123def'
        """
        try:
            # Sort kwargs for consistent key generation
            sorted_params = sorted(kwargs.items())
            
            # Create a string representation of parameters
            params_str = json.dumps(sorted_params, sort_keys=True, default=str)
            
            # Generate MD5 hash for compact, consistent keys
            params_hash = hashlib.md5(params_str.encode('utf-8')).hexdigest()[:12]
            
            # Construct the final cache key
            cache_key = f"{cls.KEY_PREFIX}:{prefix}:hash_{params_hash}"
            
            logger.debug(f"Generated cache key: {cache_key} for params: {kwargs}")
            return cache_key
            
        except Exception as e:
            logger.error(f"Error generating cache key: {str(e)}")
            # Fallback to simple key generation
            return f"{cls.KEY_PREFIX}:{prefix}:fallback_{hash(str(kwargs))}"
    
    @classmethod
    def get_cached_data(cls, cache_key: str) -> Optional[Any]:
        """
        Retrieve data from Redis cache with error handling.
        
        Args:
            cache_key (str): The cache key to retrieve
            
        Returns:
            Optional[Any]: The cached data if found, None otherwise
        """
        try:
            cached_data = cache.get(cache_key)
            
            if cached_data is not None:
                logger.debug(f"Cache HIT for key: {cache_key}")
                return cached_data
            else:
                logger.debug(f"Cache MISS for key: {cache_key}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving cached data for key {cache_key}: {str(e)}")
            return None
    
    @classmethod
    def set_cached_data(
        cls, 
        cache_key: str, 
        data: Any, 
        timeout: Optional[int] = None
    ) -> bool:
        """
        Store data in Redis cache with error handling.
        
        Args:
            cache_key (str): The cache key to store data under
            data (Any): The data to cache
            timeout (Optional[int]): Cache timeout in seconds. Defaults to 24 hours.
            
        Returns:
            bool: True if successfully cached, False otherwise
        """
        try:
            timeout = timeout or cls.DEFAULT_TIMEOUT
            
            cache.set(cache_key, data, timeout)
            logger.debug(f"Successfully cached data for key: {cache_key} (timeout: {timeout}s)")
            return True
            
        except Exception as e:
            logger.error(f"Error caching data for key {cache_key}: {str(e)}")
            return False
    
    @classmethod
    def delete_cached_data(cls, cache_key: str) -> bool:
        """
        Delete specific cached data.
        
        Args:
            cache_key (str): The cache key to delete
            
        Returns:
            bool: True if successfully deleted, False otherwise
        """
        try:
            cache.delete(cache_key)
            logger.debug(f"Successfully deleted cache for key: {cache_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting cached data for key {cache_key}: {str(e)}")
            return False
    
    @classmethod
    def invalidate_cache_pattern(cls, pattern: str) -> int:
        """
        Invalidate multiple cache keys matching a pattern.
        
        Args:
            pattern (str): The pattern to match cache keys (supports wildcards)
            
        Returns:
            int: Number of keys invalidated
            
        Example:
            >>> RedisCache.invalidate_cache_pattern('user_blog_*_user_123_*')
        """
        try:
            # Import here to avoid circular imports
            from django_redis import get_redis_connection
            
            redis_conn = get_redis_connection("default")
            
            # Construct the full pattern with prefix
            full_pattern = f"{cls.KEY_PREFIX}:*{pattern}*"
            
            # Find all keys matching the pattern
            keys = redis_conn.keys(full_pattern)
            
            if keys:
                # Delete all matching keys
                deleted_count = redis_conn.delete(*keys)
                logger.info(f"Invalidated {deleted_count} cache keys matching pattern: {pattern}")
                return deleted_count
            else:
                logger.debug(f"No cache keys found matching pattern: {pattern}")
                return 0
                
        except ImportError:
            logger.warning("django-redis not available, falling back to individual key deletion")
            # Fallback: use Django's cache framework (less efficient but works)
            return cls._fallback_pattern_invalidation(pattern)
            
        except Exception as e:
            logger.error(f"Error invalidating cache pattern {pattern}: {str(e)}")
            return 0
    
    @classmethod
    def _fallback_pattern_invalidation(cls, pattern: str) -> int:
        """
        Fallback method for pattern invalidation when redis connection is not available.
        
        Args:
            pattern (str): The pattern to match
            
        Returns:
            int: Number of keys invalidated
        """
        try:
            # This is a less efficient fallback
            # In production, ensure django-redis is properly installed
            logger.warning("Using fallback pattern invalidation - consider installing django-redis")
            
            # For now, just clear all cache as a safety measure
            cache.clear()
            logger.info("Cleared entire cache as fallback for pattern invalidation")
            return 1
            
        except Exception as e:
            logger.error(f"Error in fallback pattern invalidation: {str(e)}")
            return 0
    
    @classmethod
    def get_cache_stats(cls) -> Dict[str, Any]:
        """
        Get cache statistics and health information.
        
        Returns:
            Dict[str, Any]: Cache statistics
        """
        try:
            from django_redis import get_redis_connection
            
            redis_conn = get_redis_connection("default")
            info = redis_conn.info()
            
            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory_human': info.get('used_memory_human', 'Unknown'),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'total_commands_processed': info.get('total_commands_processed', 0),
                'redis_version': info.get('redis_version', 'Unknown'),
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {'error': str(e)}
    
    @classmethod
    def clear_all_cache(cls) -> bool:
        """
        Clear all cache data in the current cache database.
        
        WARNING: This will delete ALL cached data!
        
        Returns:
            bool: True if successfully cleared, False otherwise
        """
        try:
            cache.clear()
            logger.info("Successfully cleared all cache data")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing all cache: {str(e)}")
            return False
    
    @classmethod
    def delete_user_cache(cls, user_id: int) -> int:
        """
        Delete all cache entries for a specific user.
        
        Args:
            user_id (int): The user ID
            
        Returns:
            int: Number of cache keys deleted
        """
        patterns_to_clear = [
            f"user_blog_*_user_{user_id}_*",
            f"*_user_id_{user_id}_*",
            f"profile_*_{user_id}_*"
        ]
        
        total_deleted = 0
        for pattern in patterns_to_clear:
            deleted = cls.invalidate_cache_pattern(pattern)
            total_deleted += deleted
        
        logger.info(f"Deleted {total_deleted} cache entries for user {user_id}")
        return total_deleted
    
    @classmethod
    def delete_blog_cache(cls, blog_id: int) -> int:
        """
        Delete all cache entries for a specific blog.
        
        Args:
            blog_id (int): The blog ID
            
        Returns:
            int: Number of cache keys deleted
        """
        patterns_to_clear = [
            f"*_blog_id_{blog_id}_*",
            f"all_blog_*",  # Clear all blog lists since they include this blog
            f"user_blog_*"  # Clear user blog lists since they might include this blog
        ]
        
        total_deleted = 0
        for pattern in patterns_to_clear:
            deleted = cls.invalidate_cache_pattern(pattern)
            total_deleted += deleted
        
        logger.info(f"Deleted {total_deleted} cache entries for blog {blog_id}")
        return total_deleted
    
    @classmethod
    def delete_cache_by_key_list(cls, cache_keys: List[str]) -> int:
        """
        Delete multiple specific cache keys.
        
        Args:
            cache_keys (List[str]): List of cache keys to delete
            
        Returns:
            int: Number of keys successfully deleted
        """
        deleted_count = 0
        
        for cache_key in cache_keys:
            try:
                if cls.delete_cached_data(cache_key):
                    deleted_count += 1
            except Exception as e:
                logger.error(f"Error deleting cache key {cache_key}: {str(e)}")
        
        logger.info(f"Successfully deleted {deleted_count} out of {len(cache_keys)} cache keys")
        return deleted_count
    
    @classmethod
    def get_all_cache_keys(cls, pattern: str = "*") -> List[str]:
        """
        Get all cache keys matching a pattern.
        
        Args:
            pattern (str): Pattern to match (default: "*" for all keys)
            
        Returns:
            List[str]: List of matching cache keys
        """
        try:
            from django_redis import get_redis_connection
            
            redis_conn = get_redis_connection("default")
            full_pattern = f"{cls.KEY_PREFIX}:{pattern}"
            
            keys = redis_conn.keys(full_pattern)
            # Decode bytes to strings
            key_list = [key.decode('utf-8') if isinstance(key, bytes) else str(key) for key in keys]
            
            logger.debug(f"Found {len(key_list)} cache keys matching pattern: {pattern}")
            return key_list
            
        except ImportError:
            logger.warning("django-redis not available, cannot list cache keys")
            return []
            
        except Exception as e:
            logger.error(f"Error getting cache keys: {str(e)}")
            return []
    
    @classmethod
    def health_check(cls) -> bool:
        """
        Perform a health check on the Redis cache.
        
        Returns:
            bool: True if cache is healthy, False otherwise
        """
        try:
            test_key = f"{cls.KEY_PREFIX}:health_check"
            test_value = "ok"
            
            # Try to set and get a test value
            cache.set(test_key, test_value, 60)
            retrieved_value = cache.get(test_key)
            
            if retrieved_value == test_value:
                cache.delete(test_key)
                logger.debug("Cache health check passed")
                return True
            else:
                logger.error("Cache health check failed: value mismatch")
                return False
                
        except Exception as e:
            logger.error(f"Cache health check failed: {str(e)}")
            return False


# Convenience functions for backward compatibility and ease of use
def generate_cache_key(prefix: str, **kwargs) -> str:
    """Convenience function for generating cache keys."""
    return RedisCache.generate_cache_key(prefix, **kwargs)


def get_cached_data(cache_key: str) -> Optional[Any]:
    """Convenience function for retrieving cached data."""
    return RedisCache.get_cached_data(cache_key)


def set_cached_data(cache_key: str, data: Any, timeout: Optional[int] = None) -> bool:
    """Convenience function for storing cached data."""
    return RedisCache.set_cached_data(cache_key, data, timeout)


def invalidate_cache_pattern(pattern: str) -> int:
    """Convenience function for invalidating cache patterns."""
    return RedisCache.invalidate_cache_pattern(pattern)


def delete_cached_data(cache_key: str) -> bool:
    """Convenience function for deleting cached data."""
    return RedisCache.delete_cached_data(cache_key)


def clear_all_cache() -> bool:
    """Convenience function for clearing all cache."""
    return RedisCache.clear_all_cache()


def delete_user_cache(user_id: int) -> int:
    """Convenience function for deleting user-specific cache."""
    return RedisCache.delete_user_cache(user_id)


def delete_blog_cache(blog_id: int) -> int:
    """Convenience function for deleting blog-specific cache."""
    return RedisCache.delete_blog_cache(blog_id)


def get_all_cache_keys(pattern: str = "*") -> List[str]:
    """Convenience function for getting all cache keys."""
    return RedisCache.get_all_cache_keys(pattern)


# Production-ready cache decorators
def cache_result(timeout: int = RedisCache.DEFAULT_TIMEOUT, key_prefix: str = ""):
    """
    Decorator for caching function results.
    
    Args:
        timeout (int): Cache timeout in seconds
        key_prefix (str): Prefix for the cache key
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key based on function name and arguments
            cache_key = generate_cache_key(
                f"{key_prefix}{func.__name__}",
                args=str(args),
                kwargs=kwargs
            )
            
            # Try to get cached result
            cached_result = get_cached_data(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            set_cached_data(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator

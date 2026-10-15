import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLikedUsersAPI, updateLocalLike } from '../features/blogs/likeSlice';

export const useLikeStatus = (blog_id, initialLikeCount = 0) => {
  const dispatch = useDispatch();
  const { likedUsers, likesData } = useSelector((state) => state.like);
  const { user } = useSelector((state) => state.getProfile);
  
  // Check if user is authenticated
  const isAuthenticated = !!(user && localStorage.getItem('accessToken'));

  // Initialize like data if not present
  useEffect(() => {
    if (blog_id && !likesData[blog_id]) {
      dispatch(updateLocalLike({
        blog_id,
        total_likes: initialLikeCount,
        isLiked: false
      }));
    }
  }, [blog_id, likesData, initialLikeCount, dispatch]);

  // Update isLiked status when liked users data changes (only for authenticated users)
  useEffect(() => {
    if (blog_id && isAuthenticated && likedUsers[blog_id] && likesData[blog_id]) {
      const isLiked = likedUsers[blog_id].some(likedUser => 
        likedUser.id === user.id || likedUser.user_id === user.id
      );
      
      // Only update if the status has changed
      if (likesData[blog_id].isLiked !== isLiked) {
        dispatch(updateLocalLike({
          blog_id,
          isLiked
        }));
      }
    }
  }, [blog_id, isAuthenticated, user, likedUsers, likesData, dispatch]);

  // Get liked users for this blog when component mounts (only for authenticated users)
  useEffect(() => {
    if (blog_id && isAuthenticated) {
      // Only fetch if we don't already have the data or if it was invalidated
      if (!likedUsers[blog_id] || likedUsers[blog_id] === null) {
        dispatch(getLikedUsersAPI({ blog_id }));
      }
    }
  }, [blog_id, isAuthenticated, dispatch, likedUsers]);

  // Check if current user has liked this post (only for authenticated users)
  const isLikedByCurrentUser = () => {
    if (!isAuthenticated || !likedUsers[blog_id]) return false;
    
    return likedUsers[blog_id].some(likedUser => 
      likedUser.id === user.id || likedUser.user_id === user.id
    );
  };

  // Get total likes count
  const getTotalLikes = () => {
    if (likesData[blog_id]) {
      return likesData[blog_id].total_likes;
    }
    return initialLikeCount;
  };

  return {
    isLiked: isAuthenticated ? isLikedByCurrentUser() : false,
    totalLikes: getTotalLikes(),
    likedUsers: isAuthenticated ? (likedUsers[blog_id] || []) : []
  };
};

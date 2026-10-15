import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikeAPI, getLikedUsersAPI } from "../../features/blogs/likeSlice";
import { useLikeStatus } from "../../hooks/useLikeStatus";
import "./LikeButton.css";

const LikeButton = ({ blog_id, initialLikeCount = 0, initialIsLiked = false, size = "medium" }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.like);
  const { user } = useSelector((state) => state.getProfile);
  
  // Check if user is authenticated
  const isAuthenticated = !!(user && localStorage.getItem('accessToken'));
  
  // Use the hook to get like status only for authenticated users
  const { isLiked: hookIsLiked, totalLikes: hookTotalLikes } = useLikeStatus(blog_id, initialLikeCount);
  
  // Local state for optimistic updates
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  
  // Update local state when hook data changes or initial props change
  useEffect(() => {
    // If we have data from the hook (user is logged in), use that
    if (isAuthenticated && hookTotalLikes !== undefined) {
      setIsLiked(hookIsLiked);
      setLikeCount(hookTotalLikes);
    } else {
      // Use initial props for non-logged in users or when hook data isn't ready
      setIsLiked(initialIsLiked);
      setLikeCount(initialLikeCount);
    }
  }, [hookIsLiked, hookTotalLikes, initialIsLiked, initialLikeCount, isAuthenticated]);

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login if user is not authenticated
      window.location.href = "/login";
      return;
    }

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    try {
      await dispatch(toggleLikeAPI({ blog_id })).unwrap();
      
      // Refresh liked users list after successful toggle (only for authenticated users)
      if (isAuthenticated) {
        dispatch(getLikedUsersAPI({ blog_id }));
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newIsLiked);
      setLikeCount(newIsLiked ? likeCount : likeCount + 1);
      
      // If unauthorized, redirect to login
      if (error.status === 401 || error.message?.includes('Unauthorized')) {
        window.location.href = "/login";
      } else {
        console.error("Failed to toggle like:", error);
      }
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "like-button--small";
      case "large":
        return "like-button--large";
      default:
        return "like-button--medium";
    }
  };

  return (
    <button
      className={`like-button ${getSizeClass()} ${isLiked ? 'like-button--liked' : ''} ${!isAuthenticated ? 'like-button--disabled' : ''}`}
      onClick={handleLikeToggle}
      disabled={loading || !isAuthenticated}
      aria-label={isAuthenticated ? (isLiked ? 'Unlike post' : 'Like post') : 'Login to like post'}
      title={!isAuthenticated ? 'Login to like this post' : undefined}
    >
      <span className="like-icon">
        {isLiked ? (
          <i className="fas fa-heart"></i>
        ) : (
          <i className="far fa-heart"></i>
        )}
      </span>
      <span className="like-count">{likeCount}</span>
    </button>
  );
};

export default LikeButton;

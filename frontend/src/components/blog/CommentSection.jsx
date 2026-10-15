import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getCommentsAPI, 
  createCommentAPI, 
  updateCommentAPI, 
  deleteCommentAPI,
  getCommentRepliesAPI,
  setShowingAllComments,
  initializeComments
} from "../../features/blogs/commentSlice";
import { getStoredUserInfo } from "../../utils/tokenUtils";
import "./CommentSection.css";

const CommentSection = ({ blog_id, initialCommentsCount = 0, initialComments = [] }) => {
  const dispatch = useDispatch();
  const { 
    commentsData, 
    commentsPagination,
    showingAllComments,
    commentReplies,
    loadingReplies,
    loading, 
    creating, 
    updating, 
    deleting, 
    error 
  } = useSelector((state) => state.comment);
  const { user } = useSelector((state) => state.getProfile);
  
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showReplies, setShowReplies] = useState({}); // Track which comments have replies shown
  
  // Ref for reply textarea to auto-focus
  const replyTextareaRef = useRef(null);
  
  // Use Redux comments if available (they're more up-to-date), otherwise use initial comments
  const isShowingAll = showingAllComments[blog_id] || false;
  const reduxComments = (commentsData[blog_id] || []).filter(comment => comment);
  
  // Filter initial comments to only include parent comments (parent_id === null)
  const filteredInitialComments = (initialComments || [])
    .filter(comment => comment && (comment.parent_id === null || comment.parent_id === undefined));
  
  // Check if Redux has been initialized for this blog (even if it's now empty)
  const reduxInitialized = commentsData.hasOwnProperty(blog_id);
  
  // Priority: Use Redux comments if initialized, otherwise use initial comments
  // Once Redux is initialized, always use it (even if empty) to reflect deletions
  const comments = reduxInitialized ? reduxComments : filteredInitialComments;
  const pagination = commentsPagination[blog_id];
  const hasMoreThanThree = initialCommentsCount > 3;
  
  // Debug comments data (remove in production)
  console.log("Comments debug:", {
    blog_id,
    isShowingAll,
    reduxInitialized,
    reduxCommentsLength: reduxComments.length,
    filteredInitialCommentsLength: filteredInitialComments.length,
    finalCommentsLength: comments.length,
    usingRedux: reduxInitialized,
    initialCommentsRaw: initialComments,
    filteredInitialComments: filteredInitialComments,
    reduxComments: reduxComments,
    finalComments: comments,
    hasUndefinedComments: comments.some(comment => !comment)
  });

  // Check if user is authenticated and get user data
  const userData = user?.data || user;
  const { userId, userEmail, accessToken, isAuthenticated } = getStoredUserInfo();

  // Debug user data (remove in production)
  console.log("User authentication status:", {
    hasUserData: !!userData,
    hasUserId: !!userData?.id,
    hasUserIdFromStorage: !!userId,
    hasAccessToken: !!accessToken,
    isAuthenticated,
    userIdFromStorage: userId
  });

  // Initialize Redux state with initial comments to enable reply count updates
  useEffect(() => {
    console.log("Initialize comments useEffect:", {
      blog_id,
      filteredInitialCommentsLength: filteredInitialComments.length,
      reduxInitialized,
      shouldInitialize: blog_id && filteredInitialComments.length > 0 && !reduxInitialized
    });
    
    if (blog_id && filteredInitialComments.length > 0 && !reduxInitialized) {
      console.log("Initializing Redux state with comments:", filteredInitialComments);
      dispatch(initializeComments({ blog_id, comments: filteredInitialComments }));
    }
  }, [blog_id, filteredInitialComments.length, reduxInitialized, dispatch, filteredInitialComments]);

  // Auto-focus reply textarea when reply form opens
  useEffect(() => {
    if (replyTo && replyTextareaRef.current) {
      // Small delay to ensure the form has rendered
      setTimeout(() => {
        replyTextareaRef.current?.focus();
      }, 100);
    }
  }, [replyTo]);

  // Don't auto-load comments on mount - they come from the blog API initially
  // Only load when user clicks "See all comments"

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    try {
      // Use user ID from localStorage - more reliable than Redux state
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      await dispatch(createCommentAPI({
        blog_id,
        content: newComment,
        parent_id: (replyTo?.comment_id || replyTo?.id) || null,
        user_id: userId // userId is already an integer from utility function
      })).unwrap();
      
      // Reset form on success
      setNewComment("");
      setReplyTo(null);
      
    } catch (error) {
      // If unauthorized, redirect to login
      if (error.status === 401 || error.message?.includes('Unauthorized')) {
        window.location.href = "/login";
      } else {
        console.error("Failed to create comment:", error);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      const commentId = editingComment.comment_id || editingComment.id;
      await dispatch(updateCommentAPI({
        comment_id: commentId,
        content: editContent
      })).unwrap();
      
      setEditingComment(null);
      setEditContent("");
    } catch (error) {
      // If unauthorized, redirect to login
      if (error.status === 401 || error.message?.includes('Unauthorized')) {
        window.location.href = "/login";
      } else {
        console.error("Failed to update comment:", error);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await dispatch(deleteCommentAPI({ comment_id: commentId })).unwrap();
      } catch (error) {
        // If unauthorized, redirect to login
        if (error.status === 401 || error.message?.includes('Unauthorized')) {
          window.location.href = "/login";
        } else {
          console.error("Failed to delete comment:", error);
        }
      }
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const startReply = (comment) => {
    setReplyTo(comment);
    setNewComment("");
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleSeeAllComments = () => {
    dispatch(setShowingAllComments({ blog_id, showing: true }));
    dispatch(getCommentsAPI({ blog_id, page: 1 }));
  };

  const handleToggleReplies = async (comment) => {
    const commentId = comment.comment_id || comment.id;
    
    console.log("handleToggleReplies called for comment:", commentId);
    console.log("Current showReplies state:", showReplies[commentId]);
    console.log("Comment object:", comment);
    
    if (showReplies[commentId]) {
      // Hide replies
      console.log("Hiding replies for comment:", commentId);
      setShowReplies(prev => ({ ...prev, [commentId]: false }));
    } else {
      // Show replies - fetch them if not already loaded
      console.log("Showing replies for comment:", commentId);
      setShowReplies(prev => ({ ...prev, [commentId]: true }));
      
      if (!commentReplies[commentId]) {
        console.log("Fetching replies for comment:", commentId);
        try {
          const result = await dispatch(getCommentRepliesAPI({ comment_id: commentId })).unwrap();
          console.log("API result:", result);
        } catch (error) {
          console.error("Failed to load replies:", error);
          // Hide the replies section if loading failed
          setShowReplies(prev => ({ ...prev, [commentId]: false }));
        }
      } else {
        console.log("Replies already loaded for comment:", commentId);
      }
    }
  };

  const loadMoreComments = () => {
    if (pagination && pagination.next) {
      const nextPage = pagination.current_page + 1;
      dispatch(getCommentsAPI({ blog_id, page: nextPage }));
    }
  };

  const getProfileImage = (user) => {
    const defaultProfileImage = "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=";
    return user?.photo || defaultProfileImage;
  };

  const renderComment = (comment, isReply = false) => {
    // Add null check for comment
    if (!comment) {
      console.warn('renderComment called with null/undefined comment');
      return null;
    }

    const commentId = comment.comment_id || comment.id;
    const commentUser = comment.comment_user || comment.user;
    const isOwnComment = isAuthenticated && userId && userId === commentUser?.id;
    
    // Check if this specific comment is being edited
    const isEditing = Boolean(editingComment && 
      ((editingComment.comment_id && editingComment.comment_id === commentId) || 
       (editingComment.id && editingComment.id === commentId)));

    // Skip rendering if comment doesn't have content
    if (!comment.content) {
      return null;
    }

    return (
      <div key={commentId} className={`comment ${isReply ? 'comment-reply' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <img 
              src={getProfileImage(commentUser)} 
              alt={commentUser?.name || 'User'} 
              className="comment-avatar"
            />
            <div className="comment-meta">
              <span className="comment-author-name">
                {commentUser?.name?.replace(/-/g, ' ') || 'Unknown User'}
              </span>
              <span className="comment-date">
                {new Date(comment.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          
          {isOwnComment && (
            <div className="comment-actions">
              <button 
                onClick={() => startEditing(comment)}
                className="comment-action-btn edit-btn"
                disabled={updating}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                onClick={() => handleDeleteComment(commentId)}
                className="comment-action-btn delete-btn"
                disabled={deleting}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          )}
        </div>

        <div className="comment-content">
          {isEditing && editingComment ? (
            <form onSubmit={handleEditSubmit} className="edit-comment-form">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="edit-comment-textarea"
                rows="3"
                required
              />
              <div className="edit-comment-actions">
                <button type="submit" className="save-btn" disabled={updating}>
                  {updating ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={cancelEditing} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="comment-text">{comment.content}</p>
              <div className="comment-actions-row">
                {/* Show comment actions for all comments (both parent and replies can have replies) */}
                <div className="comment-actions-section">
                  {/* Reply button */}
                  {isAuthenticated && (
                    <button 
                      onClick={() => startReply(comment)}
                      className="reply-btn"
                    >
                      <i className="fas fa-reply"></i>
                      Reply
                    </button>
                  )}
                  
                  {/* Comment icon with count - toggle if count > 0, just display if count = 0 */}
                  {(comment.comments_count > 0 || (comment.replies && comment.replies.length > 0) || (comment.comments && comment.comments.length > 0)) ? (
                    <button 
                      onClick={() => handleToggleReplies(comment)}
                      className="toggle-replies-btn"
                      disabled={loadingReplies[commentId]}
                    >
                      <i className="fas fa-comment"></i>
                      <span>
                        {comment.comments_count || 
                         (comment.replies && comment.replies.length) || 
                         (comment.comments && comment.comments.length) || 0}
                      </span>
                      {loadingReplies[commentId] ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className={`fas fa-chevron-${showReplies[commentId] ? 'up' : 'down'}`}></i>
                      )}
                    </button>
                  ) : (
                    <span className="comment-count-display">
                      <i className="fas fa-comment"></i>
                      <span>0</span>
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reply Form - Show below the comment when replying to this specific comment */}
        {replyTo && (replyTo.comment_id || replyTo.id) === commentId && isAuthenticated && (
          <form onSubmit={handleSubmitComment} className="comment-form reply-comment-form">
            <textarea
              ref={replyTextareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Reply to ${(comment.comment_user?.name || comment.user?.name)}...`}
              className="comment-textarea"
              rows="3"
              required
            />
            <div className="reply-form-actions">
              <button type="submit" className="reply-submit-btn" disabled={creating}>
                {creating ? "Posting..." : "Reply"}
              </button>
              <button type="button" onClick={cancelReply} className="reply-cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Render replies - handle both API formats and fetched replies */}
        {showReplies[commentId] && (
          <div className="comment-replies">
            {/* First try to show replies from fetched data (from comments API) */}
            {commentReplies[commentId] && commentReplies[commentId].comments && 
              commentReplies[commentId].comments.filter(reply => reply).map(reply => renderComment(reply, true))
            }
            
            {/* If no fetched replies, show initial comment replies/comments from blog API */}
            {!commentReplies[commentId] && (comment.replies || comment.comments || []).length > 0 &&
              (comment.replies || comment.comments || []).filter(reply => reply).map(reply => renderComment(reply, true))
            }
            
            {/* Show loading state if fetching replies */}
            {loadingReplies[commentId] && !commentReplies[commentId] && (
              <div className="replies-loading">
                <div className="loading-spinner"></div>
                <span>Loading replies...</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3>Comments ({initialCommentsCount})</h3>
        {!isShowingAll && hasMoreThanThree && (
          <button 
            onClick={handleSeeAllComments}
            className="see-all-comments-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "See all comments"}
          </button>
        )}
      </div>

      {/* Parent Comment Form - Only show when not replying */}
      {isAuthenticated && !replyTo ? (
        <form onSubmit={handleSubmitComment} className="comment-form parent-comment-form">
          <div className="comment-form-header">
            <img 
              src={getProfileImage(userData) || "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="} 
              alt={userData?.name || userEmail || 'You'} 
              className="comment-form-avatar"
            />
            <span className="comment-form-name">
              {userData?.name?.replace(/-/g, ' ') || userEmail || 'You'}
            </span>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-textarea"
            rows="4"
            required
          />
          <div className="comment-form-actions">
            <button type="submit" className="submit-comment-btn" disabled={creating}>
              {creating ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>
      ) : !isAuthenticated ? (
        <div className="login-prompt">
          <p>Please <a href="/login">login</a> to leave a comment.</p>
        </div>
      ) : null}

      {/* Comments List */}
      <div className="comments-list">
        {loading && comments.length === 0 ? (
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <span>Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          comments.filter(comment => comment).map(comment => renderComment(comment))
        ) : (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}

        {error && (
          <div className="comments-error">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Load More Comments Button */}
        {isShowingAll && pagination && pagination.next && (
          <div className="load-more-comments">
            <button 
              onClick={loadMoreComments}
              className="load-more-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load more comments"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

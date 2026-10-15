import "./BlogView.css";
import {Img} from "react-image";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userAllPostsAPI, resetPosts } from "../../features/blogs/getUserAllPostSlice";
import { userPostAPI } from "../../features/blogs/getUserPostSlice";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";

const BlogView = ({ statusFilter = '' }) => {
  const { postsData, pagination, error, loading, loadingMore, hasMore, currentPage } = useSelector((state) => state.userPosts);
  const { blog } = useSelector((state) => state.blog);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!isInitialized) {
      dispatch(resetPosts());
      dispatch(userAllPostsAPI({ statusFilter, page: 1, reset: true }));
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized]);

  // Handle status filter changes
  useEffect(() => {
    if (isInitialized) {
      dispatch(resetPosts());
      dispatch(userAllPostsAPI({ statusFilter, page: 1, reset: true }));
    }
  }, [dispatch, statusFilter, isInitialized]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >= 
      document.documentElement.offsetHeight &&
      hasMore &&
      !loading &&
      !loadingMore
    ) {
      const nextPage = currentPage + 1;
      dispatch(userAllPostsAPI({ statusFilter, page: nextPage, reset: false }));
    }
  }, [dispatch, statusFilter, currentPage, hasMore, loading, loadingMore]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLinkClick = async (id, user, title) => {
    // Just navigate to the blog page - let SingleBlog.jsx handle the API call
    // user is now an object, so we need to use user.name for the URL
    const userName = user?.name || 'unknown';
    navigate(`/${userName}/posts/${title}-${id}`);
  };

  // Get status badge for post
  const getStatusBadge = (status) => {
    switch (status) {
      case 2:
        return <span className="status-badge status-published">Published</span>;
      case 3:
        return <span className="status-badge status-archived">Archived</span>;
      case 4:
        return <span className="status-badge status-rejected">Rejected</span>;
      default:
        return <span className="status-badge status-draft">Draft</span>;
    }
  };

  // console.log("postsData", postsData)
  try {
    if (Array.isArray(postsData) && postsData.length === 0 && !loading) {
      return (
        <div className="col-sm-6 offset-3 message">
          <p className="">No posts found</p>
        </div>
      )
    }
   } catch(e) {
    if (postsData.length === 0 && !loading) {
      return (
        <div className="col-sm-6 offset-3 message">
          <p className="">No posts found</p>
        </div>
      )
    }
   }

  return (
    <div className="blogs-grid">
      {Array.isArray(postsData) && postsData.length > 0 ? (
        <>
          {postsData.map((item, index) => {
            // Sanitize the description HTML
            // const sanitizedDescription = DOMPurify.sanitize(item.description);
            const sanitizedDescription = item.description;

            // Truncate the sanitized description to 150 characters and append "..."
            const truncatedDescription =
              sanitizedDescription.length > 150
                ? sanitizedDescription.slice(0, 150) + "..."
                : sanitizedDescription;

            return (
              <div className="blog-container" key={`${item.id}-${index}`}>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default link behavior
                    handleLinkClick(item.id, item.user, item.title);
                  }}
                >
                  <div className="blog-header">
                    <div className="blog-meta-info">
                      <div className="blog-meta-row">
                        <p className="blog-date">
                          Posted on {new Date(item.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })} at {new Date(item.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="blog-content">
                    <div className="blog-text-content">
                      <h4>{item.title}</h4>
                      <p dangerouslySetInnerHTML={{ __html: truncatedDescription }}></p>
                      
                      <div className="blog-footer">
                        <div className="blog-actions">
                          <LikeButton 
                            blog_id={item.id}
                            initialLikeCount={item.total_likes || 0}
                            initialIsLiked={false} // You'll need to check this based on user data
                            size="small"
                          />
                          <CommentButton 
                            commentCount={item.total_comments || 0}
                            onClick={() => handleLinkClick(item.id, item.user, item.title)}
                            size="small"
                          />
                        </div>
                        <span className="read-more-btn">Read more →</span>
                      </div>
                    </div>
                    
                    {item.photo && (
                      <div className="blog-image-container">
                        <Img className="blog-image" src={item.photo} alt={item.title} />
                      </div>
                    )}
                  </div>
                </a>
                
                {error && (
                  <p style={{ 
                    color: "var(--text-muted)", 
                    fontSize: "0.875rem", 
                    marginTop: "var(--space-sm)",
                    textAlign: "center"
                  }}>
                    Error: {error}
                  </p>
                )}
              </div>
            );
          })}
          
          {/* Loading indicator for pagination */}
          {loadingMore && (
            <div className="loading-more-container">
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading more posts...</span>
              </div>
            </div>
          )}
          
          {/* End of posts indicator */}
          {!hasMore && postsData.length > 0 && (
            <div className="end-of-posts">
              <p>🎉 You've reached the end! No more posts to load.</p>
            </div>
          )}
        </>
      ) : (
        <div className="message">
          <p>{loading ? "Loading amazing content..." : "No posts found"}</p>
        </div>
      )}
    </div>
  );
};

export default BlogView;

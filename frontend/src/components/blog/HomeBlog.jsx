import "./BlogView.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {Img} from "react-image";
import { useDispatch, useSelector } from "react-redux";
import { getAllPostsAPI, resetPosts } from "../../features/blogs/getallPostSlice";
import { userPostAPI } from "../../features/blogs/getUserPostSlice";
import { userProfileAPI } from "../../features/users/getProfileSlice";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";

const BlogView = () => {
  const { postsData, pagination, error, loading, loadingMore, hasMore, currentPage } = useSelector((state) => state.posts);
  const { blog } = useSelector((state) => state.blog);
  const { user: profileUser } = useSelector((state) => state.getProfile);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!isInitialized) {
      dispatch(resetPosts());
      dispatch(getAllPostsAPI({ page: 1, reset: true }));
      dispatch(userProfileAPI());
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >= 
      document.documentElement.offsetHeight &&
      hasMore &&
      !loading &&
      !loadingMore && 
      !error
    ) {
      const nextPage = currentPage + 1;
      dispatch(getAllPostsAPI({ page: nextPage, reset: false }));
    }
  }, [dispatch, currentPage, hasMore, loading, loadingMore]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Get profile image with fallback
  const getProfileImage = (user) => {
    // user is now an object with photo, name, etc.
    const userName = user?.name || 'Unknown User';
    
    // Default placeholder image with user's initial
    const defaultProfileImage = "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=";

    const photoUrl = user?.photo || null;
    return photoUrl || defaultProfileImage;
  };

  const handleLinkClick = async (id, user, title) => {
    // Just navigate to the blog page - let SingleBlog.jsx handle the API call
    // user is now an object, so we need to use user.name for the URL
    const userName = user?.name || 'unknown';
    navigate(`/${userName}/posts/${title}-${id}`);
  };

  // console.log("postsData home", postsData)
   if (error) {
    return (
      <div className="single-blog-error">
        <h2>Error loading blog posts</h2>
        <p>{error.message || error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

 try {
  if (Array.isArray(postsData.data) && postsData.data.length === 0 && !loading) {
    return (
      <div className="col-sm-6 offset-3 message">
        <p className="">No posts found</p>
      </div>
    )
  }
 } catch(e) {
  if ((!postsData.data || postsData.data.length === 0) && !loading) {
    return (
      <div className="col-sm-6 offset-3 message">
        <p className="">No posts found</p>
      </div>
    )
  }
 }

  return (
    <div className="blogs-grid">
      {Array.isArray(postsData.data) && postsData.data.length > 0 ? (
        <>
          {postsData.data.map((item, index) => {
            // Sanitize the description HTML
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
                    <div className="blog-author-avatar">
                      <Img
                        src={getProfileImage(item.user)}
                        alt={`${(item.user?.name || 'Unknown').replace(/-/g, ' ')} avatar`}
                        className="avatar-image"
                        loader={
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1.2rem'
                          }}>
                            {(item.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        }
                        unloader={
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1.2rem'
                          }}>
                            {(item.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        }
                      />
                    </div>
                    <div className="blog-meta-info">
                      <h6 className="blog-author-name">{(item.user?.name || 'Unknown User').replace(/-/g, ' ')}</h6>
                      <p className="blog-date">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
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
          {!hasMore && postsData.data.length > 0 && (
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

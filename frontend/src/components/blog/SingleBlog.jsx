import "./SingleBlog.css";
import {Img} from "react-image";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userPostAPI } from "../../features/blogs/getUserPostSlice";
import { userProfileAPI } from "../../features/users/getProfileSlice";
import { useCodeCopyButtons } from "../../hooks/useCodeCopyButtons";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";
import CommentSection from "./CommentSection";

const SingleBlog = () => {
  const dispatch = useDispatch();
  // const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false; // Parse localStorage as boolean
  const { blog, error, loading, isUser } = useSelector((state) => state.blog);
  const { user: profileUser } = useSelector((state) => state.getProfile);
  const { blogTitle, userName } = useParams();
  
  // Use the code copy buttons hook
  const contentRef = useCodeCopyButtons(blog?.data?.description);

  useEffect(() => {
    // Always fetch the blog post based on the current URL
    const blogId = blogTitle.match(/\d+/)?.[0];
    
    if (blogId) {
      // Check if we already have the correct blog loaded
      const currentBlogId = blog?.data?.id;
      if (!currentBlogId || currentBlogId.toString() !== blogId) {
        // Check if user is logged in
        const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;
        const accessToken = localStorage.getItem("accessToken");
        
        // If user is logged in and has a token, try the authenticated API first
        // This will work for user's own posts and fallback to public API if needed
        const isUser = isLoggedIn && accessToken;
        dispatch(userPostAPI({ id: blogId, isUser: isUser }));
      }
    }
  }, [dispatch, blogTitle, userName, blog?.data?.id]);

  // Check if this is user's own post (from dashboard) using Redux state
  const isOwnPost = () => {
    return isUser; // Use the isUser flag from Redux state
  };

  // Get profile image with fallback for author avatar
  const getAuthorProfileImage = (user) => {
    // user is now an object with photo, name, etc.
    const userName = user?.name || 'Unknown User';
    
    // Default placeholder image with user's initial
    const defaultProfileImage = "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=";

    // Try different possible photo field names from the user object
    const photoUrl = user?.photo || null;
    return photoUrl || defaultProfileImage;
  };

  if (loading) {
    return (
      <div className="single-blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="single-blog-error">
        <h2>Error loading blog post</h2>
        <p>{error.message || error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (blog.length === 0 || !blog.data) {
    return (
      <div className="single-blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  return (
    <article className="single-blog-container">
      <div className="single-blog-card">
        <header className="single-blog-header">
          <h1 className="single-blog-title">{blog.data.title}</h1>
          <div className="single-blog-meta">
            {!isOwnPost() && blog.data.user ? (
              <div className="blog-author">
                <div className="author-avatar">
                  <Img
                    src={getAuthorProfileImage(blog.data.user)}
                    alt={`${(blog.data.user?.name || 'Unknown').replace(/-/g, ' ')} avatar`}
                    className="author-avatar-image"
                    loader={
                      <div className="author-avatar-placeholder">
                        {(blog.data.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    }
                    unloader={
                      <div className="author-avatar-placeholder">
                        {(blog.data.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    }
                  />
                </div>
                <div className="author-info">
                  <span className="author-name">{(blog.data.user?.name || 'Unknown User').replace(/-/g, ' ')}</span>
                  <time className="blog-date" dateTime={blog.data.created_at}>
                    Published on {new Date(blog.data.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            ) : (
              <div className="post-date-info">
                <time className="blog-date" dateTime={blog.data.created_at}>
                  Posted on {new Date(blog.data.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            )}
          </div>
        </header>

        {blog.data.photo && (
          <div className="single-blog-image-container">
            <Img
              className="single-blog-image"
              src={blog.data.photo}
              alt={blog.data.title}
            />
          </div>
        )}

        <div className="single-blog-content">
          <div
            ref={contentRef}
            className="single-blog-description"
            dangerouslySetInnerHTML={{ __html: blog.data.description }}
          />
        </div>

        {/* Blog Actions */}
        <div className="single-blog-actions">
          <LikeButton 
            blog_id={blog.data.id}
            initialLikeCount={blog.data.total_likes || 0}
            initialIsLiked={false} // You'll need to check this based on user data
            size="medium"
          />
          <CommentButton 
            commentCount={blog.data.total_comments || 0}
            onClick={() => {
              // Scroll to comments section
              const commentsSection = document.querySelector('.comment-section');
              if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            size="medium"
          />
        </div>

        {error && (
          <div className="blog-error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {error}
          </div>
        )}
        
        {loading && (
          <div className="blog-loading">
            <div className="loading-spinner"></div>
            <span>Loading article...</span>
          </div>
        )}
      </div>

      {/* Comments Section - only render if we have blog data */}
      {blog.data && blog.data.id && (
        <CommentSection 
          blog_id={blog.data.id} 
          initialCommentsCount={blog.data.total_comments || 0}
          initialComments={blog.data.comments || []}
        />
      )}
    </article>
  );
};

export default SingleBlog;

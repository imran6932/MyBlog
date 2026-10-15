import "./SingleUserPost.css";
import SingleBlog from "../blog/SingleBlog";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { deletePostAPI } from "../../features/blogs/deletePostSlice";

const SingleUserPost = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { blog, isUser } = useSelector((state) => state.blog);
  const { error } = useSelector((state) => state.deletePost);
  const location = useLocation();

  
  useEffect(() => {
    if (blog && blog.data && blog.data.title) {
      document.title = blog.data.title;
    }
  }, [location, blog]);
  
  // console.log('isUser:', isUser, 'Blog:', blog);

  const updateBlogHandle = (id) => {
    navigate(`/update-blog/${id}`);
  };

  const deleteBlogHandle = async (id) => {
    try {
      const result = await dispatch(deletePostAPI(id)).unwrap(); // Unwrap the returned value
      // console.log("result", result)
      if (result.status === 204) {
        // console.log("Post deleted successfully");
        navigate("/dashboard"); // Redirect after successful deletion
      }
    } catch (error) {
      // console.error("Error deleting blog:", error);
    }
  };

  return (
    <div className="single-post-container">
      <div className="single-post-content">
        {!isUser ? (
          <div></div>
        ) : (
          <div className="action-container">
            <div className="action-buttons">
              <button
                className="btn-edit modern-btn"
                onClick={(e) => {
                  e.preventDefault();
                  updateBlogHandle(blog.data.id);
                }}
              >
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </span>
                <span className="btn-text">Edit Post</span>
                <span className="btn-shimmer"></span>
              </button>
              <button
                className="btn-delete modern-btn"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                    deleteBlogHandle(blog.data.id);
                  }
                }}
              >
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </span>
                <span className="btn-text">Delete Post</span>
                <span className="btn-shimmer"></span>
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {error}
          </div>
        )}

        <SingleBlog />
      </div>
    </div>
  );
};

export default SingleUserPost;

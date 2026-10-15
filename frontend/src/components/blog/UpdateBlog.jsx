import "./UpdateBlog.css";
import { useEffect, useState } from "react";
import {Img} from "react-image";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "@tinymce/tinymce-react"; // Import TinyMCE Editor
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context
import {
  updatePostAPI,
  clearError,
} from "../../features/blogs/updatePostSlice";
import { userPostAPI } from "../../features/blogs/getUserPostSlice";

const UpdateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme(); // Get current theme

  const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;
  const { blog } = useSelector((state) => state.blog);
  const { loading, error } = useSelector((state) => state.updatePost);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [formError, setFormError] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { id } = useParams();
  const tinyMceApiKey = import.meta.env.VITE_TINYMCE_API_KEY;
  const location = useLocation();
  
  // Force re-render when theme changes to update TinyMCE
  const [editorKey, setEditorKey] = useState(0);
  
  // Responsive height for TinyMCE editor
  const getEditorHeight = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) {
      return 300; // Small screens (mobile)
    } else if (screenWidth < 768) {
      return 400; // Medium screens (tablet)
    } else if (screenWidth < 1024) {
      return 500; // Large screens (small desktop)
    } else {
      return 600; // Extra large screens (desktop)
    }
  };
  
  const [editorHeight, setEditorHeight] = useState(getEditorHeight());

  
  useEffect(() => {
    document.title = "Blog | Update";
  }, [location]); // location is now correctly included as a dependency

  // Handle theme changes for TinyMCE
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [isDarkMode]);

  // Handle window resize for responsive editor height
  useEffect(() => {
    const handleResize = () => {
      const newHeight = getEditorHeight();
      if (newHeight !== editorHeight) {
        setEditorHeight(newHeight);
        setEditorKey(prev => prev + 1); // Force editor re-render with new height
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [editorHeight]);

  useEffect(() => {
    if (blog.length === 0) {
      // Extract the id from blog title using regex
      const blogId = id.match(/\d+/)?.[0];
      dispatch(userPostAPI({ id: blogId, isUser: isLoggedIn }));
    } else {
      setTitle(blog.data.title);
      setPreviewImage(blog.data.photo);
      setDescription(blog.data.description); // Initialize description content
    }
  }, [dispatch, blog]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError("Please select a valid image file");
        return;
      }
      
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
      setIsFormDirty(true);
      setFormError(""); // Clear any previous errors
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsFormDirty(true);
    if (formError && e.target.value.trim()) {
      setFormError(""); // Clear error if user starts typing
    }
  };

  const handleDescriptionChange = (content) => {
    setDescription(content);
    setIsFormDirty(true);
    if (formError && content.trim()) {
      setFormError(""); // Clear error if user starts typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setFormError("");

    const id = blog.data.id;

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!description.trim()) {
      setFormError("Description cannot be empty.");
      return;
    }

    const formData = {
      title,
      description,
      photo,
    };

    try {
      const result = await dispatch(updatePostAPI({ id, formData })).unwrap();
      if (result.status === 200) {
        setIsFormDirty(false); // Clear dirty state on successful update
        navigate(`/dashboard`);
      }
    } catch (err) {
      // console.error("Update blog error:", err);
    }
  };

  useEffect(() => {
    // Only run when there's an error
    if (error || formError) {
      const timer = setTimeout(() => {
        if (error) dispatch(clearError()); // Clear Redux error
        if (formError) setFormError(""); // Clear local form error
      }, 5000);

      // Cleanup the timer if the component unmounts or error/formError changes
      return () => clearTimeout(timer);
    }
  }, [error, formError, dispatch]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  const handleCancel = () => {
    if (isFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (blog.length === 0 || loading) {
    return (
      <div className={`update-blog-wrapper ${isDarkMode ? 'blog-dark-theme' : 'blog-light-theme'}`}>
        <div className="update-blog-loading">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <h3>Loading Blog Post...</h3>
          <p>Please wait while we fetch the content for editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`update-blog-wrapper ${isDarkMode ? 'blog-dark-theme' : 'blog-light-theme'}`}>
      <div className="update-blog-container">
        <div className="update-blog-card">
          <div className="update-blog-header">
            <h1 className="update-blog-title">
              Update Post
              {isFormDirty && <span className="unsaved-indicator">•</span>}
            </h1>
            <p className="update-blog-subtitle">
              Modify your blog post content and settings
              {isFormDirty && <span className="draft-status">Unsaved changes</span>}
            </p>
          </div>
          
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            noValidate
            className="update-blog-form"
          >
            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                <i className="fas fa-heading"></i>
                Post Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className={`form-input ${formError && !title.trim() ? 'error' : ''}`}
                placeholder="Enter an engaging title for your post"
                required
              />
              {formError && !title.trim() && (
                <span className="field-error">Title is required</span>
              )}
            </div>

            {/* TinyMCE Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <i className="fas fa-edit"></i>
                Content
              </label>
              <div className="editor-wrapper" style={{ height: `${editorHeight}px` }}>
                <Editor
                  key={editorKey}
                  apiKey={tinyMceApiKey}
                  value={description}
                  init={{
                    skin: isDarkMode ? "oxide-dark" : "oxide",
                    content_css: isDarkMode ? "dark" : "default",
                    height: editorHeight,
                    menubar: false,
                    placeholder: "Share your thoughts and ideas...",
                    plugins: "lists advlist link image code codesample table emoticons wordcount",
                    toolbar:
                      "fontsize | checklist numlist bullist | backcolor forecolor | styles | bold italic underline | link image | alignleft aligncenter alignright | codesample | emoticons | wordcount | removeformat",
                    codesample_languages: [
                      { text: 'HTML/XML', value: 'markup' },
                      { text: 'JavaScript', value: 'javascript' },
                      { text: 'CSS', value: 'css' },
                      { text: 'Python', value: 'python' },
                      { text: 'Java', value: 'java' },
                      { text: 'C++', value: 'cpp' },
                      { text: 'C#', value: 'csharp' },
                      { text: 'SQL', value: 'sql' }
                    ],
                    content_style: isDarkMode ? `
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        font-size: 16px; 
                        line-height: 1.6;
                        color: #f7fafc;
                        background-color: #2d3748;
                      }
                      .mce-content-body { 
                        color: #f7fafc; 
                        background-color: #2d3748; 
                      }
                      .mce-content-body[data-mce-placeholder]:not([data-mce-placeholder=''])::before { 
                        color: #a0aec0 !important; 
                        opacity: 0.7; 
                        font-style: italic; 
                      }
                      code {
                        background-color: #4a5568;
                        color: #e2e8f0;
                        padding: 2px 4px;
                        border-radius: 4px;
                      }
                      pre {
                        background-color: #1a202c;
                        color: #e2e8f0;
                        padding: 1rem;
                        border-radius: 8px;
                        overflow-x: auto;
                      }
                    ` : `
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        font-size: 16px; 
                        line-height: 1.6;
                        color: #2d3748;
                        background-color: #ffffff;
                      }
                      .mce-content-body { 
                        color: #2d3748; 
                        background-color: #ffffff; 
                      }
                      .mce-content-body[data-mce-placeholder]:not([data-mce-placeholder=''])::before { 
                        color: #718096 !important; 
                        opacity: 0.7; 
                        font-style: italic; 
                      }
                      code {
                        background-color: #f7fafc;
                        color: #2d3748;
                        padding: 2px 4px;
                        border-radius: 4px;
                      }
                      pre {
                        background-color: #f8fafc;
                        color: #2d3748;
                        padding: 1rem;
                        border-radius: 8px;
                        overflow-x: auto;
                      }
                    `,
                    branding: false,
                    resize: true,
                    setup: function (editor) {
                      editor.on('init', function () {
                        // Force theme update on editor initialization
                        if (isDarkMode) {
                          editor.getBody().style.backgroundColor = '#2d3748';
                          editor.getBody().style.color = '#f7fafc';
                        } else {
                          editor.getBody().style.backgroundColor = '#ffffff';
                          editor.getBody().style.color = '#2d3748';
                        }
                      });
                    }
                  }}
                  onEditorChange={handleDescriptionChange}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label htmlFor="photo" className="form-label">
                <i className="fas fa-image"></i>
                Featured Image
              </label>
              <div className="image-upload-section">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input file-input"
                />
                {previewImage && (
                  <div className="image-preview">
                    <Img
                      src={previewImage}
                      alt="Post preview"
                      className="preview-image"
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <span className="image-text">Featured Image Preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Messages */}
            {(formError || error) && (
              <div className="error-container">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{formError || error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                <i className="fas fa-arrow-left"></i>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Update Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlog;

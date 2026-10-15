import "./CreateBlog.css";
import { useState, useEffect } from "react";
import {Img} from "react-image";
import {
  createPostAPI,
  clearError,
  clearSuccess,
} from "../../features/blogs/createPostSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "@tinymce/tinymce-react"; // Import TinyMCE Editor
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context

const CreateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading, success, data } = useSelector((state) => state.createPost);
  const { isDarkMode } = useTheme(); // Get current theme

  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState(""); // State for TinyMCE content
  const [previewImage, setPreviewImage] = useState("");
  const [formError, setFormError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
  
  const [editorHeight, setEditorHeight] = useState(() => {
    const initialHeight = getEditorHeight();
    console.log('Initial editor height:', initialHeight);
    return initialHeight;
  });

  useEffect(() => {
    document.title = "Blog | Create";
  }, [location]); // location is now correctly included as a dependency

  // Handle theme changes for TinyMCE
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [isDarkMode]);

  // Handle window resize for responsive editor height
  useEffect(() => {
    const handleResize = () => {
      const newHeight = getEditorHeight();
      console.log('Resize detected. Current height:', editorHeight, 'New height:', newHeight);
      if (newHeight !== editorHeight) {
        setEditorHeight(newHeight);
        setEditorKey(prev => prev + 1); // Force editor re-render with new height
        console.log('Height updated and editor key incremented');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [editorHeight]);

  // Handle image change and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        setFormError("File size must be less than 5MB. Please choose a smaller image.");
        // Reset the file input
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setFormError("Please upload a valid image file (JPEG, PNG, GIF, or WebP).");
        e.target.value = '';
        return;
      }
      
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
      setFormError(""); // Clear any previous file errors
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setFormError("");
    setShowSuccessMessage(false);

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!description.trim()) {
      setFormError("Description cannot be empty.");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    }

    console.log('Submitting form data:', {
      title: title.trim(),
      description: description.substring(0, 100) + '...',
      hasPhoto: !!photo
    });

    try {
      const result = await dispatch(createPostAPI(formData)).unwrap();
      console.log('Create post success:', result);
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setPhoto(null);
      setPreviewImage("");
      
      // Hide success message and redirect after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/dashboard");
      }, 3000);
      
    } catch (err) {
      console.error("Create blog error:", err);
      // Error will be handled by Redux state
    }
  };

  useEffect(() => {
    if (error || formError) {
      const timer = setTimeout(() => {
        if (error) dispatch(clearError());
        if (formError) setFormError("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, formError, dispatch]);

  // Handle success message cleanup
  useEffect(() => {
    if (success && !showSuccessMessage) {
      dispatch(clearSuccess());
    }
  }, [success, showSuccessMessage, dispatch]);

  return (
    <div className={`create-blog-wrapper ${isDarkMode ? 'blog-dark-theme' : 'blog-light-theme'}`}>
      <div className="create-blog-card">
        <h2 className="create-blog-title">
          <i className="fas fa-pen-fancy"></i>
          Create a New Post
        </h2>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          noValidate
        >
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              <i className="fas fa-heading"></i>
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter the post title"
              required
            />
          </div>

          {/* TinyMCE Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <i className="fas fa-align-left"></i>
              Description
            </label>
            <div className="editor-wrapper" style={{ height: `${editorHeight}px` }}>
              <Editor
                key={editorKey}
                apiKey={tinyMceApiKey} //API key for TinyMCE
                value={description}
                init={{
                  skin: isDarkMode ? "oxide-dark" : "oxide",
                  content_css: isDarkMode ? "dark" : "default",
                  height: editorHeight,
                  menubar: false,
                  placeholder: "Write description of a post...",
                  plugins: "lists advlist link image code codesample table emoticons wordcount",
                  toolbar:
                    "undo redo | formatselect fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image codesample | table emoticons | code | wordcount",
                  content_style: isDarkMode 
                    ? "body { font-family: Inter, sans-serif; font-size: 16px; color: #f7fafc; background-color: #2d3748; } .mce-content-body { color: #f7fafc; background-color: #2d3748; } .mce-content-body[data-mce-placeholder]:not([data-mce-placeholder=''])::before { color: #a0aec0 !important; opacity: 0.7; font-style: italic; }"
                    : "body { font-family: Inter, sans-serif; font-size: 16px; color: #2d3748; background-color: #ffffff; } .mce-content-body { color: #2d3748; background-color: #ffffff; } .mce-content-body[data-mce-placeholder]:not([data-mce-placeholder=''])::before { color: #718096 !important; opacity: 0.7; font-style: italic; }",
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
                onEditorChange={(content) => setDescription(content)}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="photo" className="form-label">
              <i className="fas fa-image"></i>
              Upload Image
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            {previewImage && (
              <div className="image-preview">
                <Img
                  src={previewImage}
                  alt="Preview"
                  className="img-fluid rounded shadow"
                />
              </div>
            )}
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="success-container">
              <i className="fas fa-check-circle"></i>
              <div className="success-content">
                <h4>Post Created Successfully!</h4>
                <p>Your post has been created and is now under review. It will be published after approval.</p>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(formError || error) && !showSuccessMessage && (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle"></i>
              <span>
                {formError && `Form error: ${formError}`}
                {error && `Error: ${error}`}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || showSuccessMessage}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Submitting...
              </>
            ) : showSuccessMessage ? (
              <>
                <i className="fas fa-check"></i>
                Post Created!
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Create Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;

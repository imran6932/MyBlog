import React, { useState, useEffect } from "react";
import {Img} from "react-image";
import { useSelector, useDispatch } from "react-redux";
import { updateProfileAPI } from "../../features/users/updateProfileSlice";
import { userProfileAPI } from "../../features/users/getProfileSlice";
import "./UpdateProfile.css";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.getProfile);
  const { isDarkMode } = useTheme();

  const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [error, setError] = useState("");

  // Load existing user data
  useEffect(() => {
    if (user) {
      setName(user.data?.name);
      // setEmail(user.data?.email);
      setPreviewImage(user.data?.photo);
    }
  }, [user]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // console.log("file", file)
    if (file) {
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    // if (!email.trim()) {
    //   setError("Email is required");
    //   return;
    // }

    const formData = new FormData();
    formData.append("name", name);
    // formData.append("email", email);
    if (photo) formData.append("photo", photo);
    // console.log("formdata", formData)

    try {
      const result = await dispatch(updateProfileAPI(formData)).unwrap(); // Update profile API call
      if (result.status === 200) {
        const getProfileResult = await dispatch(userProfileAPI()).unwrap();
        if (getProfileResult.status === 200) {
          navigate("/profile");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };

  if (!user) {
    return;
  }

  return (
    <div className={`update-profile-wrapper ${isDarkMode ? 'blog-dark-theme' : 'blog-light-theme'}`}>
      <div className="update-profile-container">
        {/* Header Section */}
        <div className="update-profile-header">
          <button 
            className="back-btn"
            onClick={() => navigate("/profile")}
            title="Back to Profile"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="header-content">
            <h1 className="update-profile-title">
              <i className="fas fa-user-edit"></i>
              Update Profile
            </h1>
            <p className="update-profile-subtitle">
              Update your personal information and photo
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="update-profile-form-container">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="update-profile-form" encType="multipart/form-data" noValidate>
            {/* Photo Upload Section */}
            <div className="photo-upload-section">
              <div className="current-photo-container">
                <div className="photo-preview">
                  <Img
                    src={previewImage || "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="}
                    alt="Profile Preview"
                    className="preview-image"
                  />
                  <div className="photo-overlay">
                    <i className="fas fa-camera"></i>
                  </div>
                </div>
                <label className="photo-upload-btn">
                  <i className="fas fa-upload"></i>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Name Field */}
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-user"></i>
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate("/profile")}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                <i className="fas fa-save"></i>
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;

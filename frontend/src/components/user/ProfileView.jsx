import "./ProfileView.css";
import {Img} from "react-image";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { userProfileAPI } from "../../features/users/getProfileSlice"; // Adjust API call accordingly
import { useTheme } from "../../contexts/ThemeContext";

const MyAccount = ({ onEditClick }) => {
  const { user, loading } = useSelector((state) => state.getProfile);
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    dispatch(userProfileAPI());
  }, [dispatch]);

  // Access the actual user data from the API response
  // The API response structure is: { data: userData, status: statusCode }
  const userData = user?.data || user;

  // Default placeholder image with user's initial
  const defaultProfileImage = "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=";

  // Get profile image with fallback
  const getProfileImage = () => {
    // Try different possible photo field names from API
    const photoUrl = userData?.photo || null;
    return photoUrl || defaultProfileImage;
  };

  // Get user's full name from API data
  const getFullName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    if (userData?.name) {
      return userData.name;
    }
    if (userData?.username) {
      return userData.username;
    }
    return 'User Name';
  };

  // Get user's email from API data
  const getUserEmail = () => {
    return userData?.email || 'Email not provided';
  };

  // Format date function for registration/join date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long", 
        day: "numeric"
      });
    } catch (error) {
      return 'Not available';
    }
  };

  // Get registration date from API data
  const getRegistrationDate = () => {
    // Prioritize created_at field for registration date
    const dateField = userData?.created_at || userData?.date_joined || userData?.registration_date || userData?.joined_at;
    return formatDate(dateField);
  };

  // Debug: Log user data to see structure
  console.log('Redux state user:', user);
  console.log('Extracted userData:', userData);
  console.log('API response structure:', {
    hasData: !!userData,
    fields: userData ? Object.keys(userData) : 'No data'
  });

  return (
    <div className="profile-view-wrapper">
      <div className="profile-card">
        {/* Profile Header with Edit Button */}
        <div className="profile-header-bar">
          <div className="profile-title-section">
            <h1 className="profile-page-title">
              <i className="fas fa-user-circle"></i>
              My Profile
            </h1>
            <p className="profile-page-subtitle">
              Your personal information and account details
            </p>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={onEditClick}
            title="Edit Profile"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>

        {/* Main Profile Section */}
        <div className="profile-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                <Img
                  src={getProfileImage()}
                  alt="Profile"
                  className="profile-image"
                  loader={<div className="image-loader">Loading...</div>}
                  unloader={<img src={defaultProfileImage} alt="Profile" className="profile-image" />}
                />
                <div className="avatar-status-indicator"></div>
              </div>
            </div>
          </div>
          
          <div className="profile-content-section">
            <div className="profile-header-info">
              <h1 className="profile-name">
                {getFullName()}
              </h1>
              <p className="profile-email">
                <i className="fas fa-envelope"></i>
                {getUserEmail()}
              </p>
              <div className="profile-badge">
                <i className="fas fa-user-check"></i>
                {userData?.is_verified || userData?.is_active ? 'Verified Member' : 'Active Member'}
              </div>
            </div>

            {/* Profile Details Cards */}
            <div className="profile-details-cards">
              <div className="detail-card">
                <div className="detail-card-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="detail-card-content">
                  <span className="detail-card-label">Full Name</span>
                  <span className="detail-card-value">
                    {getFullName()}
                  </span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-card-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="detail-card-content">
                  <span className="detail-card-label">Email Address</span>
                  <span className="detail-card-value">{getUserEmail()}</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-card-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="detail-card-content">
                  <span className="detail-card-label">Member Since</span>
                  <span className="detail-card-value">
                    {getRegistrationDate()}
                  </span>
                </div>
              </div>

              {/* Additional API fields if available */}
              {userData?.username && (
                <div className="detail-card">
                  <div className="detail-card-icon">
                    <i className="fas fa-at"></i>
                  </div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Username</span>
                    <span className="detail-card-value">{userData.username}</span>
                  </div>
                </div>
              )}

              {(userData?.phone || userData?.phone_number) && (
                <div className="detail-card">
                  <div className="detail-card-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Phone Number</span>
                    <span className="detail-card-value">{userData.phone || userData.phone_number}</span>
                  </div>
                </div>
              )}

              {userData?.bio && (
                <div className="detail-card bio-card">
                  <div className="detail-card-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Bio</span>
                    <span className="detail-card-value">{userData.bio}</span>
                  </div>
                </div>
              )}

              {userData?.location && (
                <div className="detail-card">
                  <div className="detail-card-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Location</span>
                    <span className="detail-card-value">{userData.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading profile...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;

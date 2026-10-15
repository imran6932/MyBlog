import "./Dashboard.css";
import { useEffect, useState } from "react";
import BlogView from "../blog/BlogView";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { userProfileAPI } from "../../features/users/getProfileSlice"; // Adjust API call accordingly
import { resetPosts } from "../../features/blogs/getUserAllPostSlice";
import { useTheme } from "../../contexts/ThemeContext";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { user, loading } = useSelector((state) => state.getProfile);
  const [statusFilter, setStatusFilter] = useState(''); // Default to 'all' (empty string)

  useEffect(() => {
    document.title = "Blog | Dashboard";
  }, [location]); // location is now correctly included as a dependency

  useEffect(() => {
    dispatch(userProfileAPI());
  }, [dispatch]);

  const onClickCreateHandle = (e) => {
    e.preventDefault();
    navigate("/create-blog");
  };

  const handleStatusFilterChange = (e) => {
    const newFilter = e.target.value;
    setStatusFilter(newFilter);
    // Reset posts when filter changes to ensure clean state
    dispatch(resetPosts());
  };

  // Get status label for display
  const getStatusLabel = (status) => {
    switch (status) {
      case '2': return 'Published';
      case '3': return 'Archived';
      case '4': return 'Rejected';
      default: return 'All';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="welcome-section">
              <h1 className="dashboard-title">
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.first_name || 'Writer'}! Ready to share your thoughts?
              </p>
            </div>
            
            <div className="dashboard-actions">
              <button 
                className="create-post-btn primary-btn"
                onClick={onClickCreateHandle}
              >
                <i className="fas fa-plus"></i>
                Create New Post
              </button>
            </div>
          </div>
        </div>

        {/* Blog Posts Section */}
        <div className="dashboard-content">
          <div className="content-header">
            <div className="content-header-left">
              <h2 className="content-title">
                <i className="fas fa-newspaper"></i>
                Your Blog Posts
              </h2>
            </div>
            <div className="content-header-right">
              <div className="filter-dropdown">
                <label htmlFor="status-filter" className="filter-label">
                  <i className="fas fa-filter"></i>
                  Filter by Status:
                </label>
                <select 
                  id="status-filter"
                  value={statusFilter} 
                  onChange={handleStatusFilterChange}
                  className="status-filter-select"
                >
                  <option value="">All</option>
                  <option value="2">Published</option>
                  <option value="3">Archived</option>
                  <option value="4">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="blog-view-wrapper">
            <BlogView statusFilter={statusFilter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

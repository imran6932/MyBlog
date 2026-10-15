import "./SignUp.css";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupAPI, clearError } from "../../features/users/signupSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const SignUp = () => {
  const dispatch = useDispatch();
  const { isSignedUp, loading, error } = useSelector((state) => state.signup);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  
  useEffect(() => {
    document.title = "Blog | Signup";
  }, [location]); // location is now correctly included as a dependency

  // State to hold input values
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Clear the error when the user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is not valid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const { confirmPassword, ...userData } = formData; // Exclude confirmPassword
      dispatch(signupAPI(userData));
    }
  };

  // Effect to clear error message and navigate on success
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timeout); // Cleanup timeout
    }

    if (isSignedUp) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/verify-otp");
    }
  }, [error, isSignedUp, navigate, dispatch]);
  return (
    <div className={`signup-container ${
      isDarkMode ? "blog-dark-theme" : "blog-light-theme"
    }`}>
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join us and start your blogging journey</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmpassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="signup-btn"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {error && (
            <div className="server-error">
              {error}
            </div>
          )}
        </form>

        <div className="signup-footer">
          <p className="login-link">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

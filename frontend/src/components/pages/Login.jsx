import "./Login.css";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAPI,
  generateOTPAPI,
  clearError,
} from "../../features/users/loginSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error, isVerifyError, isLoggedIn } = useSelector(
    (state) => state.login
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  
  useEffect(() => {
    document.title = "Blog | Login";
  }, [location]); // location is now correctly included as a dependency

  // State to hold input values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is not valid";

    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    // console.log("submit btn clicked");
    e.preventDefault();
    if (validate()) {
      dispatch(loginAPI(formData));
    }
  };

  // Set up a timeout to clear the error after 3 seconds
  useEffect(() => {
    if (error) {
      // console.log("isVerifyError", isVerifyError);
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
    if (isVerifyError) {
      setFormData("");
      dispatch(generateOTPAPI({ email: formData.email }));
      setTimeout(() => {
        navigate("/verify-otp");
      }, 3000);
      // navigate("/verify-otp");
    }
    if (isLoggedIn === true) {
      setFormData("");
      navigate("/dashboard"); // Navigate to another page after submission
    }
  }, [error, isVerifyError, formData.email, isLoggedIn, navigate, dispatch]);

  return (
    <div className={`login-container ${
      isDarkMode ? "blog-dark-theme" : "blog-light-theme"
    }`}>
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email || ""}
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
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="forgot-password">
            <Link to="/reset-password">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {error && (
            <div className="server-error">
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import "./ForgotPassword.css";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  forgotPasswordAPI,
  clearError,
} from "../../features/users/forgotPasswordSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isSuccess, error, loading } = useSelector(
    (state) => state.forgotPassword
  );

  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    document.title = "Blog | Forgot Password";
  }, [location]); // location is now correctly included as a dependency

  // State to hold input values
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const validate = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is not valid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    // console.log("submit btn clicked");
    e.preventDefault();
    if (validate()) {
      dispatch(forgotPasswordAPI(formData));
    }
  };

  // Set up a timeout to clear the error after 5 seconds
  useEffect(() => {
    // console.log("is success", isSuccess);
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
    if (isSuccess) {
      // console.log("navigating to reset confirm page...");
      navigate("/reset-password-confirm"); // Navigate to another page after submission
    }

    // Clean up the timer if the component unmounts or error changes
    return;
  }, [error, isSuccess, navigate, dispatch]);
  return (
    <>
      <div className="forgot-password-container">
        <div className="row">
          <div className="col-sm-4 offset-sm-4">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                ></input>
              </div>
              {errors.email && (
                <p
                  style={{
                    color: "red",
                    fontSize: "0.8em",
                    marginTop: "10px",
                  }}
                >
                  {errors.email}
                </p>
              )}

              <br />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submiting..." : "Submit"}
              </button>
            </form>
            {error && (
              <p style={{ color: "red", fontSize: "0.8em", marginTop: "10px" }}>
                Error: {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

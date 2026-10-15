import "./ChangePassword.css";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  changePasswordAPI,
  clearError,
} from "../../features/users/changePasswordSlice";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { isSuccess, error, loading } = useSelector(
    (state) => state.changePassword
  );

  const [errors, setErrors] = useState({});
  const [showMessage, setshowMessage] = useState(false);
  const successMessage = "You have successfully changed your password";
  const location = useLocation();

  
  useEffect(() => {
    document.title = "Blog | Change Password";
  }, [location]);

  // State to hold input values
  const [formData, setFormData] = useState({
    new_password1: "",
    new_password2: "",
  });

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

    if (formData.new_password1.length < 8)
      newErrors.new_password1 = "Password must be minimum 8 characters";
    else if (formData.new_password1 !== formData.new_password2)
      newErrors.new_password1 = "Password does not matched";

    if (!formData.new_password1)
      newErrors.new_password1 = "Password is required";

    if (!formData.new_password2)
      newErrors.new_password2 = "Confirm Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    // console.log("submit btn clicked");
    e.preventDefault();
    if (validate()) {
      dispatch(changePasswordAPI({ new_password: formData.new_password1 }));
      setFormData({ new_password1: "", new_password2: "" });
    }
  };

  // Set up a timeout to clear the error after 5 seconds
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
    if (isSuccess) {
      setshowMessage(true);
      setTimeout(() => {
        dispatch(clearError());
        setshowMessage(false);
      }, 5000);
    }

    // Clean up the timer if the component unmounts or error changes
    return;
  }, [error, isSuccess, dispatch]);
  return (
    <>
      <div className="row">
        <div className="col-sm-4 offset-sm-4">
          <div className="change-password-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="new_password1">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="new_password1"
                  name="new_password1"
                  value={formData.new_password1}
                  onChange={handleChange}
                  placeholder="Enter new password"
                ></input>
              </div>
              {errors.new_password1 && (
                <p
                  style={{
                    color: "red",
                    fontSize: "0.8em",
                    marginTop: "10px",
                  }}
                >
                  {errors.new_password1}
                </p>
              )}
              <br />
              <div className="form-group">
                <label htmlFor="new_password2">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="new_password2"
                  name="new_password2"
                  value={formData.new_password2}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                ></input>
              </div>
              {errors.new_password2 && (
                <p
                  style={{
                    color: "red",
                    fontSize: "0.8em",
                    marginTop: "10px",
                  }}
                >
                  {errors.new_password2}
                </p>
              )}
              <br />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
            {error && (
              <p style={{ color: "red", fontSize: "0.8em", marginTop: "10px" }}>
                Error: {error}
              </p>
            )}
            <br />
            {showMessage && (
              <h3
                style={{ color: "green", fontSize: "1.0em", marginTop: "10px" }}
              >
                {successMessage}
              </h3>
            )}
            <div className="back-btn text-center my-5">
              <Link to="/dashboard" className="btn btn-success">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;

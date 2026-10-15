import "./VerifyOTP.css";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTPAPI, clearError } from "../../features/users/verifyOTPSlice";

const VerifyOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.verifyotp);
  const { loginUserEmail } = useSelector((state) => state.login);
  const { signupUserEmail } = useSelector((state) => state.signup);
  const location = useLocation();

  
  useEffect(() => {
    document.title = "Blog | Verify OTP";
  }, [location]); // location is now correctly included as a dependency

  // State to hold input values
  const [formData, setFormData] = useState({
    otp: "",
    email: signupUserEmail || loginUserEmail || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    // console.log("submit btn clicked",formData);
    e.preventDefault();
    const result = await dispatch(verifyOTPAPI(formData)).unwrap();
    // console.log("result", result);
    if (result.status === 200) {
      navigate("/dashboard"); // Navigate to another page after submission
    }
  };

  // Set up a timeout to clear the error after 5 seconds
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }

    // Clean up the timer if the component unmounts or error changes
    return;
  }, [error, dispatch]);
  return (
    <>
      <div className="col-sm-4 offset-4">
        <div className="verify-container">
          <div className="form-group">
            <label htmlFor="otp">Verify OTP</label>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="otp"
                id=""
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                className="form-control mt-2"
              />
              <button
                type="submit"
                className="btn btn-primary mt-4"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
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

export default VerifyOTP;

import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getTokenStatus, clearAuthData } from "../../utils/tokenUtils";

function ProtectedRoute({ children, page }) {
  const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;
  
  useEffect(() => {
    // Check token validity on route change
    if (isLoggedIn) {
      const tokenStatus = getTokenStatus();
      
      // If token is expired, clear auth data and let the normal flow handle redirect
      if (tokenStatus.exists && tokenStatus.isExpired) {
        clearAuthData();
        // Don't show notification here as this is a proactive check
        // The notification will show when an actual API call fails
      }
    }
  }, [isLoggedIn, page]);

  // For public pages (Home, Login, SignUp, SingleUserPost), allow access regardless of auth status
  if (page === "Home" || page === "Login" || page === "SignUp" || page === "SingleUserPost") {
    // If logged in and trying to access Login/SignUp, redirect to dashboard
    if (isLoggedIn && (page === "Login" || page === "SignUp")) {
      const tokenStatus = getTokenStatus();
      if (tokenStatus.isValid) {
        return <Navigate to="/dashboard" />;
      }
    }
    return children;
  }

  // For protected pages, check authentication
  const tokenStatus = getTokenStatus();
  const isValidlyLoggedIn = isLoggedIn && tokenStatus.isValid;

  if (!isValidlyLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;

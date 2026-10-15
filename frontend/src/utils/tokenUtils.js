/**
 * Utility functions for JWT token handling
 */

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expiration time
    if (!payload.exp) return false;
    
    // Compare expiration time with current time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't decode the token, consider it expired
    console.warn('Failed to decode JWT token:', error);
    return true;
  }
};

/**
 * Gets the token from localStorage and checks if it's valid
 * @returns {object} - Object with token, isValid, and isExpired properties
 */
export const getTokenStatus = () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return {
      token: null,
      isValid: false,
      isExpired: false, // No token means it wasn't expired, just missing
      exists: false
    };
  }
  
  const expired = isTokenExpired(token);
  
  return {
    token,
    isValid: !expired,
    isExpired: expired,
    exists: true
  };
};

/**
 * Clears authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.setItem('isLoggedIn', 'false');
};

/**
 * Gets user information from localStorage
 * @returns {object} - Object with userId, userEmail, and isAuthenticated
 */
export const getStoredUserInfo = () => {
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  const accessToken = localStorage.getItem('accessToken');
  
  return {
    userId: userId ? parseInt(userId) : null,
    userEmail,
    accessToken,
    isAuthenticated: !!(userId && accessToken)
  };
};

import axios from 'axios';
import { getTokenStatus, clearAuthData } from './tokenUtils';

const BaseURL = import.meta.env.VITE_BASE_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: BaseURL,
  timeout: 10000,
});

// Request interceptor to add authorization header
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const tokenStatus = getTokenStatus();
      
      // Only show session expired message if there was a valid token that expired
      if (tokenStatus.exists && tokenStatus.isExpired) {
        window.dispatchEvent(new CustomEvent('auth-notification', {
          detail: { type: 'auth-expired' }
        }));
      }
      
      // Clear authentication data
      clearAuthData();
      
      // Dispatch logout action using custom event
      window.dispatchEvent(new CustomEvent('force-logout'));
      
      // Redirect to login page after a short delay to allow notification to show
      const shouldShowNotification = tokenStatus.exists && tokenStatus.isExpired;
      const currentPath = window.location.pathname;
      
      setTimeout(() => {
        // Don't redirect if on public pages
        if (currentPath !== '/login' && 
            currentPath !== '/signup' && 
            currentPath !== '/forgot-password' &&
            currentPath !== '/verify-otp' &&
            currentPath !== '/confirm-reset-password' &&
            currentPath !== '/' &&
            !currentPath.match(/^\/[^/]+\/posts\/[^/]+$/)) { // Don't redirect on post pages
          window.location.href = '/login';
        }
      }, shouldShowNotification ? 1000 : 100); // Shorter delay if no notification shown
    }
    return Promise.reject(error);
  }
);

export default apiClient;

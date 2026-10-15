import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logOut } from '../../features/users/loginSlice';
import './AuthNotification.css';

const AuthNotification = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.detail?.type === 'auth-expired') {
        setMessage('Your session has expired. Please sign in again.');
        setShow(true);
        
        // Auto hide after 4 seconds to give user time to read
        setTimeout(() => {
          setShow(false);
        }, 4000);
      }
    };

    const handleForceLogout = () => {
      dispatch(logOut());
    };

    window.addEventListener('auth-notification', handleAuthError);
    window.addEventListener('force-logout', handleForceLogout);
    
    return () => {
      window.removeEventListener('auth-notification', handleAuthError);
      window.removeEventListener('force-logout', handleForceLogout);
    };
  }, [dispatch]);

  if (!show) return null;

  return (
    <div className="auth-notification">
      <div className="auth-notification-content">
        <div className="auth-notification-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <span className="auth-notification-message">{message}</span>
      </div>
    </div>
  );
};

export default AuthNotification;

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logOut } from '../features/users/loginSlice';
import { useNavigate } from 'react-router-dom';

const useAuthCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const accessToken = localStorage.getItem('accessToken');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      // If user is supposed to be logged in but has no token
      if (isLoggedIn === 'true' && !accessToken) {
        console.log('Token missing but user marked as logged in - logging out');
        dispatch(logOut());
        navigate('/login');
        return;
      }

      // If there's a token, you could also decode it to check expiration
      // This is optional and depends on your JWT structure
      if (accessToken) {
        try {
          // Basic check - in a real app you might decode the JWT
          // const decoded = jwt_decode(accessToken);
          // const currentTime = Date.now() / 1000;
          // if (decoded.exp < currentTime) {
          //   dispatch(logOut());
          //   navigate('/login');
          // }
        } catch (error) {
          console.log('Invalid token format - logging out');
          dispatch(logOut());
          navigate('/login');
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    // Check when the page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTokenExpiration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, navigate]);
};

export default useAuthCheck;

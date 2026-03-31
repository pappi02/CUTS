import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from './useAuth';
import { 
  updateLastActivity
} from '../store/slices/uiSlice';


const INACTIVITY_TIMEOUT = 60000; // 1 minute

export const useInactivityLogout = () => {
  const dispatch = useDispatch();
  const { logout } = useAuth();


  // Update last activity on user interaction
  const timerRef = useRef(null);

  const handleActivity = useCallback(() => {
    dispatch(updateLastActivity());
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [dispatch, logout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, handleActivity, true));

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    handleActivity();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity, true));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [handleActivity]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
};

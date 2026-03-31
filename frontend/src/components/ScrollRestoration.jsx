import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setScrollPosition } from '../store/slices/uiSlice';

const ScrollRestoration = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const scrollPosition = useSelector((state) => state.ui.scrollPosition);

  useEffect(() => {
    // Save scroll position on unmount/route change
    return () => {
      dispatch(setScrollPosition(window.scrollY));
    };
  }, [location.pathname, dispatch]);

  useEffect(() => {
    // Restore scroll position
    if (scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [location.pathname, scrollPosition]);

  return children;
};

export default ScrollRestoration;

import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useLogoutMutation, useGetProfileQuery } from '../features/auth/authApi';
import { setUser, clearUser } from '../store/slices/authSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Fetch profile on mount if we have a session
  const { data: profileData, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined, {
    skip: false,
  });

  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    if (profileData) {
      localStorage.setItem('cachedUser', JSON.stringify(profileData));
      dispatch(setUser(profileData));
    } else if (profileError) {
      localStorage.removeItem('cachedUser');
      dispatch(clearUser());
    }
  }, [profileData, profileError, dispatch]);

  const login = async (username, password) => {
    try {
      const result = await loginMutation({ username, password }).unwrap();
      if (result.user) {
        localStorage.setItem('cachedUser', JSON.stringify(result.user));
        dispatch(setUser(result.user));
      }
      // After successful login, profile query will auto-refetch via tag invalidation
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.data?.detail || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      localStorage.removeItem('cachedUser');
      dispatch(clearUser());
    }
  };

  return {
    user,
    isLoading: profileLoading || loginLoading,
    login,
    logout,
  };
};

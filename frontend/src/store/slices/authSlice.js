import { createSlice } from '@reduxjs/toolkit';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');
    if (user && lastActivity) {
      const now = Date.now();
      if (now - parseInt(lastActivity) < INACTIVITY_TIMEOUT) {
        return JSON.parse(user);
      } else {
        // Clear expired session
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
      }
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return null;
};

const saveUserToStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('lastActivity', Date.now().toString());
};

const clearUserFromStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('lastActivity');
};

const initialState = {
  user: loadUserFromStorage(),
  isLoading: false,
  error: null,
  inactivityTimer: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
      saveUserToStorage(action.payload);
      resetInactivityTimer(state);
    },
    clearUser: (state) => {
      state.user = null;
      clearUserFromStorage();
      if (state.inactivityTimer) {
        clearTimeout(state.inactivityTimer);
        state.inactivityTimer = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateActivity: (state) => {
      saveUserToStorage(state.user);
      resetInactivityTimer(state);
    },
  },
});

const resetInactivityTimer = (state) => {
  if (state.inactivityTimer) {
    clearTimeout(state.inactivityTimer);
  }
  state.inactivityTimer = setTimeout(() => {
    // Logout due to inactivity
    state.user = null;
    clearUserFromStorage();
    window.location.href = '/login';
  }, INACTIVITY_TIMEOUT);
};

export const { setUser, clearUser, setLoading, setError, updateActivity } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export default authSlice.reducer;


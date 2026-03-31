import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light', // or 'dark'
  sidebarOpen: true,
  notifications: [], // for in-app notifications (toasts)
  lastActivity: Date.now(),
  inactivityTimer: 0,
  scrollPosition: 0,
  showScrollToTop: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setInactivityTimer: (state, action) => {
      state.inactivityTimer = action.payload;
    },
    clearInactivityTimer: (state) => {
      state.inactivityTimer = 0;
    },
    setScrollPosition: (state, action) => {
      state.scrollPosition = action.payload;
    },
    setShowScrollToTop: (state, action) => {
      state.showScrollToTop = action.payload;
    },
    scrollToTop: (state) => {
      state.scrollPosition = 0;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  markNotificationRead,
  removeNotification,
  updateLastActivity,
  setInactivityTimer,
  clearInactivityTimer,
  setScrollPosition,
  setShowScrollToTop,
  scrollToTop,
} = uiSlice.actions;
export default uiSlice.reducer;


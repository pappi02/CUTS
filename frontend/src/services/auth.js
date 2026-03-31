import api from './api';

export const login = (username, password) => api.post('/auth/login/', { username, password });

export const logout = () => api.post('/auth/logout/');

export const refreshToken = () => api.post('/auth/refresh/');

export const fetchProfile = () => api.get('/auth/profile/');

export const fetchCsrfToken = () => api.get('/auth/csrf/');


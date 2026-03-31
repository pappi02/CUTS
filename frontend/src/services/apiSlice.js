import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Helper to get CSRF token from cookies
const getCsrfToken = () => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include', // Important for cookies (JWT, CSRF)
    prepareHeaders: (headers, { getState }) => {
      // Add CSRF token for non-GET requests
      const method = headers.get('X-HTTP-Method-Override') || headers.get('method') || 'get';
      if (method.toLowerCase() !== 'get') {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          headers.set('X-CSRFToken', csrfToken);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Ticket', 'User', 'Category', 'Group', 'Article'], // For cache invalidation
  endpoints: (builder) => ({}), // We'll inject endpoints from feature slices
});


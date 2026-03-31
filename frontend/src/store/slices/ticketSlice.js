import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
    filters: {
    status: null,
    priority: null,
    category: null,
    assigned_to: null,
    assigned_to_me: false,
    created_after: null,
    created_before: null,
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
  sort: {
    field: 'created_at',
    order: 'desc',
  },
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.pagination.page = 1; // Reset to first page on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
      state.pagination.page = 1;
    },
  },
});

export const getFilteredParams = createSelector(
  (state) => state.tickets,
  ({ filters, pagination, sort }) => {
    const params = {};

    // Filter values (skip null/undefined/empty, except assigned_to_me for special handling)
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null && value !== '' && key !== 'assigned_to_me') {
        params[key] = value;
      }
    });

    // Special handling for assigned_to_me
    if (filters.assigned_to_me === true) {
      params.assigned_to_me = true;
    }

    // Always include pagination & sorting
    params.page = pagination.page;
    params.page_size = pagination.pageSize;
    params.ordering = sort.order === 'desc' ? `-${sort.field}` : sort.field;

    return params;
  }
);

export const { setFilter, clearFilters, setPage, setPageSize, setSort } = ticketSlice.actions;
export default ticketSlice.reducer;


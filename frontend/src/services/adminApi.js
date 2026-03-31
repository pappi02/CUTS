import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Schools
    getSchools: builder.query({
      query: (params) => ({ url: '/schools/', params }),
      providesTags: ['School'],
    }),
    createSchool: builder.mutation({
      query: (school) => ({
        url: '/schools/',
        method: 'POST',
        body: school,
      }),
      invalidatesTags: ['School'],
    }),
    updateSchool: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/schools/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['School'],
    }),
    deleteSchool: builder.mutation({
      query: (id) => ({
        url: `/schools/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['School'],
    }),
    // Departments
    getDepartments: builder.query({
      query: (params) => ({ url: '/departments/', params }),
      providesTags: ['Department'],
    }),
    createDepartment: builder.mutation({
      query: (dept) => ({
        url: '/departments/',
        method: 'POST',
        body: dept,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/departments/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Department'],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
    // Categories
    getCategories: builder.query({
      query: (params) => ({ url: '/categories/', params }),
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (category) => ({
        url: '/categories/',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/categories/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    // AssignmentGroups
    getAssignmentGroups: builder.query({
      query: (params) => ({ url: '/assignment-groups/', params }),
      providesTags: ['AssignmentGroup'],
    }),
    createAssignmentGroup: builder.mutation({
      query: (group) => ({
        url: '/assignment-groups/',
        method: 'POST',
        body: group,
      }),
      invalidatesTags: ['AssignmentGroup'],
    }),
    updateAssignmentGroup: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/assignment-groups/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['AssignmentGroup'],
    }),
    deleteAssignmentGroup: builder.mutation({
      query: (id) => ({
        url: `/assignment-groups/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AssignmentGroup'],
    }),
    // Rules
    getRules: builder.query({
      query: (params) => ({ url: '/rules/', params }),
      providesTags: ['Rule'],
    }),
    createRule: builder.mutation({
      query: (rule) => ({
        url: '/rules/',
        method: 'POST',
        body: rule,
      }),
      invalidatesTags: ['Rule'],
    }),
    updateRule: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/rules/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Rule'],
    }),
    deleteRule: builder.mutation({
      query: (id) => ({
        url: `/rules/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rule'],
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAssignmentGroupsQuery,
  useCreateAssignmentGroupMutation,
  useUpdateAssignmentGroupMutation,
  useDeleteAssignmentGroupMutation,
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} = adminApi;


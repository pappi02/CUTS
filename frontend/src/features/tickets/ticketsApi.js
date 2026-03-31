import { apiSlice } from '../../services/apiSlice';

export const ticketsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params) => ({
        url: '/tickets/',
        params, // filters, pagination
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Ticket', id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),
    getTicket: builder.query({
      query: (id) => `/tickets/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),
    createTicket: builder.mutation({
      query: (ticket) => ({
        url: '/tickets/',
        method: 'POST',
        body: ticket,
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
    updateTicket: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tickets/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }],
    }),
    addComment: builder.mutation({
      query: ({ ticketId, comment }) => ({
        url: `/tickets/${ticketId}/comments/`,
        method: 'POST',
        body: comment,
      }),
      invalidatesTags: (result, error, { ticketId }) => [{ type: 'Ticket', id: ticketId }],
    }),
    assignTicket: builder.mutation({
      query: ({ ticketId, userId, groupId }) => ({
        url: `/tickets/${ticketId}/assign/`,
        method: 'POST',
        body: { user_id: userId, group_id: groupId },
      }),
      invalidatesTags: (result, error, { ticketId }) => [{ type: 'Ticket', id: ticketId }],
    }),
    resolveTicket: builder.mutation({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}/resolve/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, ticketId) => [{ type: 'Ticket', id: ticketId }],
    }),
    reopenTicket: builder.mutation({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}/reopen/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, ticketId) => [{ type: 'Ticket', id: ticketId }],
    }),
getCategories: builder.query({
      query: () => '/core/categories/',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    getAgents: builder.query({
      query: () => '/users/?role=staff&role=faculty&role=admin',
      providesTags: [{ type: 'User', id: 'LIST' }],
    }),
    getGroups: builder.query({
      query: () => '/groups/',
      providesTags: [{ type: 'Group', id: 'LIST' }],
    }),
    uploadAttachment: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/tickets/attachments/',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddCommentMutation,
  useAssignTicketMutation,
  useResolveTicketMutation,
  useReopenTicketMutation,
  useGetCategoriesQuery,
  useGetAgentsQuery,
  useGetGroupsQuery,
  useUploadAttachmentMutation,
} = ticketsApi;


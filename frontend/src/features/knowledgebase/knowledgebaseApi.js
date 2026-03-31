import { apiSlice } from '../../services/apiSlice';

export const knowledgebaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: (params) => ({
        url: '/kb/articles/',
        params, // { search, category, page }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Article', id })),
              { type: 'Article', id: 'LIST' },
            ]
          : [{ type: 'Article', id: 'LIST' }],
    }),
    getArticle: builder.query({
      query: (id) => `/kb/articles/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),
    createArticle: builder.mutation({
      query: (article) => ({
        url: '/kb/articles/',
        method: 'POST',
        body: article,
      }),
      invalidatesTags: [{ type: 'Article', id: 'LIST' }],
    }),
    updateArticle: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/kb/articles/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }],
    }),
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `/kb/articles/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Article', id: 'LIST' }],
    }),
    getKbCategories: builder.query({
      query: () => '/kb/categories/',
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetKbCategoriesQuery,
} = knowledgebaseApi;

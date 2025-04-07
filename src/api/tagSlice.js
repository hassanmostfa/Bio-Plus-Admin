import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the API slice using RTK Query
export const tagApi = createApi({
  reducerPath: "tagApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // Get the token from localStorage (or Redux state)
      const token = localStorage.getItem("token");

      // If a token exists, add it to the headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getTags: builder.query({
      query: ({ page, limit }) => ({
        url: '/admin/tags',
        params: { page, limit }, // Pass page and limit as query parameters
      }),
    }),
    getTag: builder.query({
      query: (id) => `/admin/tags/${id}`,
    }),
    addTag: builder.mutation({
      query: (data) => ({
        url: "/admin/tags",
        method: "POST",
        body: data,
      }),
    }),
    updateTag: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/tags/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/admin/tags/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks generated by the API service
export const {
  useGetTagsQuery,
  useGetTagQuery,
  useAddTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;

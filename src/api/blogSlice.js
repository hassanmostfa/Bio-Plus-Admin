import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the API slice using RTK Query
export const blogApi = createApi({
  reducerPath: "blogApi",
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
    getBlogs: builder.query({
      query: ({ page, limit }) => ({
        url: '/admin/blogs',
        params: { page, limit }, // Pass page and limit as query parameters
      }),
    }),
    getBlog: builder.query({
      query: (id) => `/admin/blogs/${id}`,
    }),
    addBlog: builder.mutation({
      query: (data) => ({
        url: "/admin/blogs",
        method: "POST",
        body: data,
      }),
    }),
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/blogs/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/admin/blogs/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks generated by the API service
export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;

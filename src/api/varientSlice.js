import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the API slice using RTK Query
export const VarientApi = createApi({
  reducerPath: "VarientApi",
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
    getVarients: builder.query({
      query: (params) => ({
        url: '/admin/product-variants',
        params: params, // Automatically appends ?page=1&limit=10
      }),
    }),
    
    
    getVarient: builder.query({
      query: (id) => `/admin/product-variants/${id}`,
    }),
    addVarient: builder.mutation({
      query: (varient) => ({
        url: "/admin/product-variants",
        method: "POST",
        body: varient,
      }),
    }),
    updateVarient: builder.mutation({
      query: ({ id, varient }) => ({
        url: `/admin/product-variants/${id}`,
        method: "PUT",
        body: varient,
      }),
    }),
    deleteVarient: builder.mutation({
      query: (id) => ({
        url: `/admin/product-variants/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks generated by the API service
export const {
  useGetVarientsQuery,
  useGetVarientQuery,
  useAddVarientMutation,
  useUpdateVarientMutation,
  useDeleteVarientMutation,
} = VarientApi;


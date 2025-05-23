import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the API slice using RTK Query
export const documentSlice = createApi({
  reducerPath: "documentSlice",
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
    getDocuments: builder.query({
      query: (params) => ({
        url: '/admin/documents',
        params: params, // Pass page and limit as query parameters
      }),
    }),
    getDocumentById: builder.query({
      query: (id) => ({
        url: `/admin/documents/${id}`,
      }),
    }),
    assignDocument: builder.mutation({
      query: ({id,data}) => ({
        url: `/admin/documents/${id}/assign`,
        method: "POST",
        body: data,
      }),
    }),
    rejectDocument: builder.mutation({
      query: ({id,data}) => ({
        url: `/admin/documents/${id}/reject`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks generated by the API service
export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useAssignDocumentMutation,
  useRejectDocumentMutation,
} = documentSlice;

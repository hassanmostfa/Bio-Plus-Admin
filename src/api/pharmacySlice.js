import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the API slice using RTK Query
export const pharmacyApi = createApi({
  reducerPath: "pharmacyApi",
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
    getPharmacies: builder.query({
      query: () => '/admin/pharmacies',
    }),
    getPharmacy: builder.query({
      query: (id) => `/admin/pharmacy/${id}`,
    }),
    addPharmacy: builder.mutation({
      query: (pharmacy) => ({
        url: "/admin/pharmacy",
        method: "POST",
        body: pharmacy,
      }),
    }),
    updatePharmacy: builder.mutation({
      query: ({ id, pharmacy }) => ({
        url: `/admin/pharmacy/${id}`,
        method: "PUT",
        body: pharmacy,
      }),
    }),
    deletePharmacy: builder.mutation({
      query: (id) => ({
        url: `/admin/pharmacies/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks generated by the API service
export const {
  useGetPharmaciesQuery,
  useGetPharmacyQuery,
  useAddPharmacyMutation,
  useUpdatePharmacyMutation,
  useDeletePharmacyMutation,
} = pharmacyApi;

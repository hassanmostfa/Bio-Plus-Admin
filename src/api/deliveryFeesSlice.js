import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the deliveryFeesSlice
export const deliveryFeesSlice = createApi({
  reducerPath: "deliveryFeesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['DeliveryFees'],
  endpoints: (builder) => ({

    // GET /admin/delivery-fees
    getDeliveryFees: builder.query({
      query: () => '/admin/delivery-fees',
      providesTags: ['DeliveryFees'],
    }),

    // PATCH /admin/delivery-fees
    updateDeliveryFees: builder.mutation({
      query: (updatedData) => ({
        url: '/admin/delivery-fees',
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: ['DeliveryFees'],
    }),

  }),
});

// Export hooks
export const {
  useGetDeliveryFeesQuery,
  useUpdateDeliveryFeesMutation,
} = deliveryFeesSlice;

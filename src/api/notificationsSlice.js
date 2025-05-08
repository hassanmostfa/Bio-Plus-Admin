import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base URL
const baseUrl = "https://back.biopluskw.com/api/v1";

// Create the API slice
export const notificationApi = createApi({
  reducerPath: "notificationApi",
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

  endpoints: (builder) => ({
    postNotification: builder.mutation({
      query: (data) => ({
        url: "/admin/notification", // Adjust path if needed
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hook
export const { usePostNotificationMutation } = notificationApi;

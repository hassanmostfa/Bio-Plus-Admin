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
    getNotifications: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, search = '' } = params;
        const queryParams = new URLSearchParams();
        
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        
        const queryString = queryParams.toString();
        return `/admin/notification${queryString ? `?${queryString}` : ''}`;
      },
    }),
    postNotification: builder.mutation({
      query: (data) => ({
        url: "/admin/notification", // Adjust path if needed
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const { useGetNotificationsQuery, usePostNotificationMutation } = notificationApi;

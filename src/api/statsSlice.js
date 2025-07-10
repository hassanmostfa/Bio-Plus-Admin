import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://back.biopluskw.com/api/v1";

export const statsApi = createApi({
  reducerPath: "statsApi",
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
    getStats: builder.query({
      query: () => "/admin/stats", // Replace with the actual stats endpoint
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          if (error.error?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem("token");
            window.location.href = "/admin/auth/sign-in";
          }
        }
      },
    }),
  }),
});

export const { useGetStatsQuery } = statsApi;

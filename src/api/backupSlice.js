import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const baseUrl = "https://back.biopluskw.com/api/v1";

export const backupApi = createApi({
  reducerPath: 'backupApi',
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
    getBackups: builder.query({
      query: () => '/admin/db/backups',
      
    }),

    createBackup: builder.mutation({
      query: (data) => ({
        url: '/admin/db/backup',
        method: 'POST',
        // body: data,
      }),
    }),
    downloadBackup: builder.mutation({
      query: (id) => ({
        url: `/admin/db/backup/${id}/download`,
        method: 'GET',
        responseHandler: (response) => response.text(),
      }),
    }),
    restoreBackup: builder.mutation({
      query: (data) => ({
        url: `/admin/db/backup/restore-upload`,
        method: 'POST',
        body: data,
      }),
     
    }),
    createCustomBackup: builder.mutation({
      query: (data) => ({
        url: `/admin/db/backup/restore/custom`,
        method: 'POST',
        body: data,
      }),
    }),

  }),
});

export const {
  useGetBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useDownloadBackupMutation,
  useCreateCustomBackupMutation,
} = backupApi; 
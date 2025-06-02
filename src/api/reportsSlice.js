   import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

   export const reportsApi = createApi({
   reducerPath: 'reportsApi',
   baseQuery: fetchBaseQuery({
      baseUrl: 'https://back.biopluskw.com/api/v1', // replace with your actual base URL
      prepareHeaders: (headers, { getState }) => {
         return headers;
      },
   }),
   endpoints: (builder) => ({
      // 1. Get Products Stock Report
      getProductsStockReport: builder.query({
         query: ({ page = 1, limit = 10 }) => ({
         url: '/admin/reports/products/stock',
         params: { page, limit },
         }),
      }),
      // 2. Get Pharmacies Revenue Report
      getPharmaciesRevenueReport: builder.query({
         query: ({ page = 1, limit = 10 }) => ({
         url: '/admin/reports/pharmacies/revenue',
         params: { page, limit },
         }),
      }),
      // 3. Get Clinics Report
      getClinicsReport: builder.query({
         query: ({ page = 1, limit = 10 }) => ({
         url: '/admin/reports/clinics',
         params: { page, limit },
         }),
      }),
   }),
   });

   export const {
   useGetProductsStockReportQuery,
   useGetPharmaciesRevenueReportQuery,
   useGetClinicsReportQuery,
   } = reportsApi;

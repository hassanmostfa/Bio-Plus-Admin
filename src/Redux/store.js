import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { aboutApi } from "api/aboutSlice";
import { BannerApi } from "api/bannerSlice";
import { blogApi } from "api/blogSlice";
import { BrandApi } from "api/brandSlice";
import { CategoryApi } from "api/categorySlice";
import { clinicApi } from "api/clinicSlice";
import { doctorApi } from "api/doctorSlice";
import { specializationApi } from "api/doctorSpecializationSlice";
import { filesApi } from "api/filesSlice";
import { pharmacyApi } from "api/pharmacySlice";
import { privacyApi } from "api/privacySlice";
import { ProductApi } from "api/productSlice";
import { PromocodeApi } from "api/promocodeSlice";
import { retrurnApi } from "api/returnSlice";
import { roleApi } from "api/roleSlice";
import { tagApi } from "api/tagSlice";
import { TypeApi } from "api/typeSlice";
import { apiService } from "api/userSlice";
import { VarientApi } from "api/varientSlice";

// import { userApi, authReducer } from './userSlice';

export const store = configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [pharmacyApi.reducerPath]: pharmacyApi.reducer,
    [CategoryApi.reducerPath]:CategoryApi.reducer,
    [BrandApi.reducerPath]:BrandApi.reducer,
    [TypeApi.reducerPath]:TypeApi.reducer,
    [VarientApi.reducerPath]:VarientApi.reducer,
    [clinicApi.reducerPath]:clinicApi.reducer,
    [PromocodeApi.reducerPath]:PromocodeApi.reducer,
    [tagApi.reducerPath]:tagApi.reducer,
    [aboutApi.reducerPath]:aboutApi.reducer,
    [privacyApi.reducerPath]:privacyApi.reducer,
    [retrurnApi.reducerPath]:retrurnApi.reducer,
    [blogApi.reducerPath]:blogApi.reducer,
    [BannerApi.reducerPath]:BannerApi.reducer,
    [specializationApi.reducerPath]:specializationApi.reducer,
    [doctorApi.reducerPath]:doctorApi.reducer,
    [ProductApi.reducerPath]:ProductApi.reducer,
    [filesApi.reducerPath]:filesApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiService.middleware,
      roleApi.middleware,
      pharmacyApi.middleware,
      CategoryApi.middleware,
      BrandApi.middleware,
      TypeApi.middleware,
      VarientApi.middleware,
      clinicApi.middleware,
      PromocodeApi.middleware,
      tagApi.middleware,
      aboutApi.middleware,
      privacyApi.middleware,
      retrurnApi.middleware,
      blogApi.middleware,
      BannerApi.middleware,
      specializationApi.middleware,
      doctorApi.middleware,
      ProductApi.middleware,
      filesApi.middleware,
    ),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// See `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

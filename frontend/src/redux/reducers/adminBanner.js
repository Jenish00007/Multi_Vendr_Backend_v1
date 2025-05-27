import { createSlice } from "@reduxjs/toolkit";
import {
  createAdminBanner,
  getAllAdminBanners,
  updateAdminBanner,
  deleteAdminBanner,
} from "../actions/adminBanner";

const initialState = {
  banners: [],
  loading: false,
  error: null,
};

const adminBannerSlice = createSlice({
  name: "adminBanner",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create banner
      .addCase(createAdminBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAdminBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload.banner);
      })
      .addCase(createAdminBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to create banner";
      })
      // Get all banners
      .addCase(getAllAdminBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAdminBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.banners;
      })
      .addCase(getAllAdminBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to fetch banners";
      })
      // Update banner
      .addCase(updateAdminBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAdminBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(
          (banner) => banner._id === action.payload.banner._id
        );
        if (index !== -1) {
          state.banners[index] = action.payload.banner;
        }
      })
      .addCase(updateAdminBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to update banner";
      })
      // Delete banner
      .addCase(deleteAdminBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAdminBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter(
          (banner) => banner._id !== action.payload.id
        );
      })
      .addCase(deleteAdminBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to delete banner";
      });
  },
});

export const { clearErrors } = adminBannerSlice.actions;
export default adminBannerSlice.reducer; 
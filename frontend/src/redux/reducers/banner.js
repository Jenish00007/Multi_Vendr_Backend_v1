import { createSlice } from "@reduxjs/toolkit";
import {
  createBanner,
  getAllBannersOfShop,
  deleteBanner,
  updateBanner,
} from "../actions/banner";

const initialState = {
  banners: [],
  loading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create banner
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload.banner);
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to create banner";
      })
      // Get all banners
      .addCase(getAllBannersOfShop.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBannersOfShop.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.banners;
      })
      .addCase(getAllBannersOfShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to fetch banners";
      })
      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter(
          (banner) => banner._id !== action.payload.id
        );
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to delete banner";
      })
      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(
          (banner) => banner._id === action.payload.banner._id
        );
        if (index !== -1) {
          state.banners[index] = action.payload.banner;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to update banner";
      });
  },
});

export const { clearErrors } = bannerSlice.actions;
export default bannerSlice.reducer; 
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { server } from "../../server";
// Create banner
export const createAdminBanner = createAsyncThunk(
  "adminBanner/create",
  async (formData) => {
    try {
      const response = await axios.post(
        `${server}/admin-banner/create`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Banner created successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating banner");
      throw error.response?.data;
    }
  }
);

// Get all banners
export const getAllAdminBanners = createAsyncThunk(
  "adminBanner/getAll",
  async () => {
    try {
      const response = await axios.get(
        `${server}/admin-banner/all`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching banners");
      throw error.response?.data;
    }
  }
);

// Update banner
export const updateAdminBanner = createAsyncThunk(
  "adminBanner/update",
  async ({ id, formData }) => {
    try {
      const response = await axios.put(
        `${server}/admin-banner/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Banner updated successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating banner");
      throw error.response?.data;
    }
  }
);

// Delete banner
export const deleteAdminBanner = createAsyncThunk(
  "adminBanner/delete",
  async (id) => {
    try {
      const response = await axios.delete(
        `${server}/admin-banner/${id}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Banner deleted successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting banner");
      throw error.response?.data;
    }
  }
); 
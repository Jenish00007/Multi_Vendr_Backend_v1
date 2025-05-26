import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Create banner
export const createBanner = createAsyncThunk(
  "banner/create",
  async (formData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/banner/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success("Banner created successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }
);

// Get all banners of shop
export const getAllBannersOfShop = createAsyncThunk(
  "banner/getAllBannersOfShop",
  async (shopId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/banner/all`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
);

// Delete banner
export const deleteBanner = createAsyncThunk(
  "banner/delete",
  async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/banner/${id}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Banner deleted successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }
);

// Update banner
export const updateBanner = createAsyncThunk(
  "banner/update",
  async ({ id, formData }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/banner/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success("Banner updated successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }
); 
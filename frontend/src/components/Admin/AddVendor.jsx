import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAllSellers } from "../../redux/actions/sellers";
import { AiOutlineShop, AiOutlineMail, AiOutlinePhone, AiOutlineUser, AiOutlineHome, AiOutlineNumber } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";

const AddVendor = ({ setOpen }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    zipCode: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("zipCode", formData.zipCode);
      if (avatar) {
        formDataToSend.append("shopAvatar", avatar);
      }

      const response = await axios.post(`${server}/shop/create-shop`, formDataToSend, {
        withCredentials: true,
      });

      toast.success("Vendor created successfully!");
      dispatch(getAllSellers());
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <AiOutlineShop className="text-blue-600" size={24} />
            </div>
            Add New Vendor
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <span className="text-gray-500 hover:text-gray-700 text-xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Shop Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineShop className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter shop name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineMail className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlinePhone className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineHome className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineNumber className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Shop Logo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setAvatar(null);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="shopAvatar"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                "Create Vendor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendor; 
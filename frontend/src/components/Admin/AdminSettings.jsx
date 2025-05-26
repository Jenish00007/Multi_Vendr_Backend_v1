import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import axios from "axios";
import { toast } from "react-toastify";

const AdminSettings = () => {
  const { user } = useSelector((state) => state.user);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(user && user.name);
  const [email, setEmail] = useState(user && user.email);
  const [phoneNumber, setPhoneNumber] = useState(user && user.phoneNumber);
  const [address, setAddress] = useState(user && user.address);

  const dispatch = useDispatch();

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    await axios.put(`${server}/user/update-avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }).then((res) => {
      toast.success("Avatar updated successfully!");
    }).catch((error) => {
      toast.error(error.response.data.message);
    });
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    await axios.put(
      `${server}/user/update-user-info`,
      {
        name,
        email,
        phoneNumber,
        address,
      },
      {
        withCredentials: true,
      }
    ).then((res) => {
      toast.success("Profile updated successfully!");
    }).catch((error) => {
      toast.error(error.response.data.message);
    });
  };

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full bg-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
        </div>

        <div className="w-full flex flex-col items-center">
          <div className="relative">
            <img
              src={`${backend_url}${user?.avatar}`}
              alt=""
              className="w-[150px] h-[150px] rounded-full object-cover border-4 border-blue-500"
            />
            <div className="w-[30px] h-[30px] bg-blue-500 rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px]">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image">
                <AiOutlineCamera className="text-white" size={20} />
              </label>
            </div>
          </div>

          <form
            aria-required={true}
            className="flex flex-col items-center w-full max-w-2xl mt-8"
            onSubmit={updateHandler}
          >
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 
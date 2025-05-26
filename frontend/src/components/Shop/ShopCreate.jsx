import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaStore } from "react-icons/fa";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const ShopCreate = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState();
    const [address, setAddress] = useState("");
    const [zipCode, setZipCode] = useState();
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const config = { headers: { "Content-Type": "multipart/form-data" } };

        const newForm = new FormData();

        newForm.append("file", avatar);
        newForm.append("name", name);
        newForm.append("email", email);
        newForm.append("password", password);
        newForm.append("zipCode", zipCode);
        newForm.append("address", address);
        newForm.append("phoneNumber", phoneNumber);

        axios
            .post(`${server}/shop/create-shop`, newForm, config)
            .then((res) => {
                toast.success("Shop created successfully!");
                navigate("/dashboard");
                window.location.reload(true);
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                <div className="flex justify-center">
                    <FaStore className="text-5xl text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create Your Shop
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our marketplace as a seller
                </p>
            </div>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-4xl'>
                <div className='bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 transform transition-all hover:scale-[1.01]'>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Shop Name */}
                                <div>
                                    <label htmlFor="name" className='block text-sm font-medium text-gray-700'>
                                        Shop Name
                                    </label>
                                    <div className='mt-1'>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className='block text-sm font-medium text-gray-700'>
                                        Email Address
                                    </label>
                                    <div className='mt-1'>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phoneNumber" className='block text-sm font-medium text-gray-700'>
                                        Phone Number
                                    </label>
                                    <div className='mt-1'>
                                        <input
                                            type="number"
                                            name="phoneNumber"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className='block text-sm font-medium text-gray-700'>
                                        Address
                                    </label>
                                    <div className='mt-1'>
                                        <input
                                            type="text"
                                            name="address"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Zip Code */}
                                <div>
                                    <label htmlFor="zipCode" className='block text-sm font-medium text-gray-700'>
                                        Zip Code
                                    </label>
                                    <div className='mt-1'>
                                        <input
                                            type="number"
                                            name="zipCode"
                                            required
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className='block text-sm font-medium text-gray-700'>
                                        Password
                                    </label>
                                    <div className='mt-1 relative'>
                                        <input
                                            type={visible ? "text" : "password"}
                                            name="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                        {visible ? (
                                            <AiOutlineEye
                                                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                                                size={20}
                                                onClick={() => setVisible(false)}
                                            />
                                        ) : (
                                            <AiOutlineEyeInvisible
                                                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                                                size={20}
                                                onClick={() => setVisible(true)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Avatar Upload */}
                        <div>
                            <label htmlFor="avatar" className='block text-sm font-medium text-gray-700'>
                                Shop Logo
                            </label>
                            <div className='mt-1'>
                                <input
                                    type="file"
                                    id="avatar"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                    onChange={handleImage}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type='submit'
                                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]'
                            >
                                Create Shop
                            </button>
                        </div>

                        <div className={`${styles.noramlFlex} w-full`}>
                            <h4 className="text-gray-600">Already have a shop account?</h4>
                            <Link to="/shop-login" className="text-blue-600 pl-2 font-medium hover:text-blue-500 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ShopCreate






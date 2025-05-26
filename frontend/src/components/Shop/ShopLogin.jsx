import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaStore } from "react-icons/fa";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const ShopLogin = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();

        await axios
            .post(
                `${server}/shop/login-shop`,
                {
                    email,
                    password,
                },
                { withCredentials: true }
            ).then((res) => {
                toast.success("Login Success!")
                navigate("/dashboard")
                window.location.reload(true);
            })
            .catch((err) => {
                toast.error(err.response.data.message);
            });
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                <div className="flex justify-center">
                    <FaStore className="text-5xl text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome Back, Seller
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please sign in to your shop account
                </p>
            </div>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
                <div className='bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 transform transition-all hover:scale-[1.01]'>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email address
                            </label>
                            <div className='mt-1'>
                                <input type="email"
                                    name='email'
                                    autoComplete='email'
                                    required
                                    placeholder='Enter your email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                />
                            </div>
                        </div>
                        
                        {/* Password */}
                        <div>
                            <label htmlFor="password"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Password
                            </label>
                            <div className='mt-1 relative'>
                                <input type={visible ? "text" : "password"}
                                    name='password'
                                    autoComplete='current-password'
                                    required
                                    placeholder='Enter your password'
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

                        <div className={`${styles.noramlFlex} justify-between`}>
                            <div className={`${styles.noramlFlex}`}>
                                <input
                                    type="checkbox"
                                    name="remember-me"
                                    id="remember-me"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Remember me
                                </label>
                            </div>
                            <div className='text-sm'>
                                <a
                                    href=".forgot-password"
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type='submit'
                                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]'
                            >
                                Sign in
                            </button>
                        </div>

                        <div className={`${styles.noramlFlex} w-full`}>
                            <h4 className="text-gray-600">Don't have a shop account?</h4>
                            <Link to="/shop-create" className="text-blue-600 pl-2 font-medium hover:text-blue-500 transition-colors">
                                Create shop
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ShopLogin







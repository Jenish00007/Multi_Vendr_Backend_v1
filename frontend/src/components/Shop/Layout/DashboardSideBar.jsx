import React from "react";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { BsGraphUp } from "react-icons/bs";

const DashboardSideBar = ({ active, openSidebar }) => {
    return (
        <div className={`${openSidebar ? 'block' : 'hidden'} md:block w-full h-screen bg-white shadow-sm overflow-y-auto sticky top-0 left-0 z-10`}>
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BsGraphUp size={28} />
                    Seller Panel
                </h2>
            </div>
            <div className="p-4">
                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <RxDashboard size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 1 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            Dashboard
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-products" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <FiShoppingBag size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 2 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            All Products
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-create-product" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 3 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <AiOutlineFolderAdd size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 3 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            Create Product
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-orders" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 4 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <FiPackage size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 4 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            All Orders
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-events" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 5 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <MdOutlineLocalOffer size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 5 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            All Events
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-coupouns" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 6 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <AiOutlineGift size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 6 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            All Coupons
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-refunds" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 7 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <HiOutlineReceiptRefund size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 7 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            Refunds
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-messages" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 8 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <BiMessageSquareDetail size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 8 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            Messages
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/dashboard-withdraw-money" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 9 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <CiMoneyBill size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 9 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            Withdraw Money
                        </h5>
                    </Link>
                </div>

                <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
                    <Link to="/settings" className="w-full flex items-center">
                        <div className={`p-2 rounded-lg ${active === 10 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                            <CiSettings size={22} />
                        </div>
                        <h5
                            className={`pl-4 text-[16px] font-medium ${
                                active === 10 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                            }`}
                        >
                            Settings
                        </h5>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardSideBar;
import React from "react";
import { FiShoppingBag, FiUsers, FiSettings } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { CiMoneyBill } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BsHandbag, BsGraphUp } from "react-icons/bs";
import { MdOutlineLocalOffer } from "react-icons/md";

const AdminSideBar = ({ active, openSidebar }) => {
  return (
    <div className={`${openSidebar ? 'block' : 'hidden'} md:block w-full h-[90vh] bg-white shadow-sm overflow-y-scroll sticky top-0 left-0 z-10`}>
      <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BsGraphUp size={28} />
          Admin Panel
        </h2>
      </div>
      <div className="p-4">
        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin/dashboard" className="w-full flex items-center">
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
          <Link to="/admin-orders" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <FiShoppingBag size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 2 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
              }`}
            >
              All Orders
            </h5>
          </Link>
        </div>

        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin-sellers" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 3 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <GrWorkshop size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 3 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
              }`}
            >
              All Sellers
            </h5>
          </Link>
        </div>

        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin-users" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 4 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <FiUsers size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 4 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
              }`}
            >
              All Users
            </h5>
          </Link>
        </div>

        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin-products" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 5 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <BsHandbag size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 5 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
              }`}
            >
              All Products
            </h5>
          </Link>
        </div>

        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin-events" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 6 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <MdOutlineLocalOffer size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 6 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
              }`}
            >
              All Events
            </h5>
          </Link>
        </div>

        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin-withdraw-request" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 7 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <CiMoneyBill size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 7 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
              }`}
            >
              Withdraw Requests
            </h5>
          </Link>
        </div>

        <div className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
          <Link to="/admin-settings" className="w-full flex items-center">
            <div className={`p-2 rounded-lg ${active === 8 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
              <FiSettings size={22} />
            </div>
            <h5
              className={`pl-4 text-[16px] font-medium ${
                active === 8 ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
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

export default AdminSideBar;

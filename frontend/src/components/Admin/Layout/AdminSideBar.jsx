import React, { useState } from "react";
import { FiShoppingBag, FiUsers, FiSettings, FiSearch } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { CiMoneyBill } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BsHandbag, BsGraphUp, BsGrid, BsListUl, BsListNested, BsImages } from "react-icons/bs";
import { MdOutlineLocalOffer } from "react-icons/md";

const AdminSideBar = ({ active, openSidebar }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const menuItems = [
    { id: 1, title: "Dashboard", icon: <RxDashboard size={22} />, path: "/admin/dashboard" },
    { id: 2, title: "All Orders", icon: <FiShoppingBag size={22} />, path: "/admin-orders" },
    { id: 3, title: "All Sellers", icon: <GrWorkshop size={22} />, path: "/admin-sellers" },
    { id: 4, title: "All Users", icon: <FiUsers size={22} />, path: "/admin-users" },
    { id: 5, title: "All Products", icon: <BsHandbag size={22} />, path: "/admin-products" },
    { id: 6, title: "All Events", icon: <MdOutlineLocalOffer size={22} />, path: "/admin-events" },
    { id: 7, title: "Withdraw Requests", icon: <CiMoneyBill size={22} />, path: "/admin-withdraw-request" },
    { id: 9, title: "Modules", icon: <BsGrid size={22} />, path: "/admin-modules" },
    { id: 10, title: "Categories", icon: <BsListUl size={22} />, path: "/admin-categories" },
    { id: 11, title: "Subcategories", icon: <BsListNested size={22} />, path: "/admin-subcategories" },
    { id: 12, title: "Banners", icon: <BsImages size={22} />, path: "/admin-banners" },
    { id: 13, title: "Settings", icon: <FiSettings size={22} />, path: "/admin-settings" },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${openSidebar ? 'block' : 'hidden'} md:block w-full h-screen bg-white shadow-xl sidebar-shadow overflow-y-scroll hide-scrollbar sticky top-0 left-0 z-10`}>
      <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="relative">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
      </div>
      <div className="p-4">
        {filteredMenuItems.map((item) => (
          <div key={item.id} className="w-full flex items-center p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 group">
            <Link to={item.path} className="w-full flex items-center">
              <div className={`p-2 rounded-lg ${active === item.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'}`}>
                {item.icon}
              </div>
              <h5
                className={`pl-4 text-[16px] font-medium ${
                  active === item.id ? "text-blue-500" : "text-gray-600 group-hover:text-blue-500"
                }`}
              >
                {item.title}
              </h5>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSideBar;

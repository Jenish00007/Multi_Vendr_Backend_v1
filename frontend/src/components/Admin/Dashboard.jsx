import React, { useEffect, useState } from "react";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineShoppingCart, AiOutlineDollar, AiOutlineShop, AiOutlineUser } from "react-icons/ai";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalSellers: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${server}/admin/dashboard-stats`, { withCredentials: true });
        if (res.data) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to fetch dashboard statistics");
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <AiOutlineShoppingCart className="text-blue-500" size={24} />,
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Total Revenue",
      value: `US$ ${stats.totalRevenue}`,
      icon: <AiOutlineDollar className="text-green-500" size={24} />,
      color: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Total Sellers",
      value: stats.totalSellers,
      icon: <AiOutlineShop className="text-purple-500" size={24} />,
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <AiOutlineUser className="text-orange-500" size={24} />,
      color: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 pt-1 mt-6 md:mt-10">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Monitor your platform's performance</p>
      </div>
      {/* Responsive horizontal scroll for cards on xs screens */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[340px] grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-lg shadow-lg p-4 sm:p-6 min-w-[250px] transition-transform duration-300 hover:scale-[1.03]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-600">{stat.title}</h3>
                  <p className={`text-xl sm:text-2xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-white shadow-md">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
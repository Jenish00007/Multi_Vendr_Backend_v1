import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { AiOutlineArrowRight, AiOutlineMoneyCollect, AiOutlineShoppingCart, AiOutlineLineChart } from "react-icons/ai";
import { MdOutlineStorefront, MdOutlineTrendingUp, MdOutlinePeopleAlt, MdOutlineWavingHand } from "react-icons/md";
import { BsGraphUpArrow, BsCurrencyRupee, BsFilter } from "react-icons/bs";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import Loader from "../Layout/Loader";
import { getAllSellers } from "../../redux/actions/sellers";
import { FiSearch } from "react-icons/fi";
import AdminSideBar from "./Layout/AdminSideBar";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );
  const { sellers } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
  }, []);

  const adminEarning =
    adminOrders &&
    adminOrders.reduce((acc, item) => acc + item.totalPrice * 0.1, 0);

  const adminBalance = adminEarning?.toFixed(2);

  // Calculate total items count from all orders
  const totalItemsCount = adminOrders?.reduce((acc, order) => {
    return acc + order?.cart?.reduce((cartAcc, item) => cartAcc + item.qty, 0);
  }, 0) || 0;
   // Calculate total products count from all sellers
   const totalProductsCount = sellers?.reduce((acc, seller) => {
    return acc + (seller?.products?.length || 0);
  }, 0) || 0;


  // Get unique customers count
  const uniqueCustomers = adminOrders ? new Set(adminOrders.map(order => order.user?._id)).size : 0;

  // Function to format currency in Indian format
  const formatIndianCurrency = (amount) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Order ID", 
      minWidth: 180, 
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-4 w-full group">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 shadow-sm">
            <AiOutlineShoppingCart className="text-blue-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-semibold text-gray-800 truncate leading-tight group-hover:text-blue-600 transition-colors duration-200">#{params.value.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-1">Order ID</span>
          </div>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 160,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: (params) => {
        const status = params.getValue(params.id, "status");
        return `custom-cell status-${status.toLowerCase()}`;
      },
      renderCell: (params) => {
        const status = params.getValue(params.id, "status");
        const statusConfig = {
          Delivered: {
            bg: "bg-gradient-to-r from-green-100 to-emerald-100",
            text: "text-green-800",
            icon: "✓",
            label: "Delivered",
            shadow: "shadow-green-100"
          },
          Processing: {
            bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
            text: "text-yellow-800",
            icon: "⟳",
            label: "Processing",
            shadow: "shadow-yellow-100"
          },
          Pending: {
            bg: "bg-gradient-to-r from-blue-100 to-sky-100",
            text: "text-blue-800",
            icon: "⏳",
            label: "Pending",
            shadow: "shadow-blue-100"
          },
          Cancelled: {
            bg: "bg-gradient-to-r from-red-100 to-rose-100",
            text: "text-red-800",
            icon: "✕",
            label: "Cancelled",
            shadow: "shadow-red-100"
          }
        };
        const config = statusConfig[status] || statusConfig.Processing;
        return (
          <div className="flex items-center justify-center w-full">
            <div className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${config.bg} ${config.text} ${config.shadow} flex items-center gap-2.5 min-w-[130px] justify-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
              <span className="text-base animate-pulse">{config.icon}</span>
              {config.label}
            </div>
          </div>
        );
      },
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 160,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-4 w-full group">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex-shrink-0 group-hover:from-purple-100 group-hover:to-purple-200 transition-all duration-300 shadow-sm">
            <AiOutlineShoppingCart className="text-purple-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[80px]">
            <span className="font-semibold text-gray-800 leading-tight group-hover:text-purple-600 transition-colors duration-200">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-1">Total Items</span>
          </div>
        </div>
      ),
    },
    {
      field: "total",
      headerName: "Total Amount",
      type: "number",
      minWidth: 180,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-4 w-full group">
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex-shrink-0 group-hover:from-green-100 group-hover:to-emerald-200 transition-all duration-300 shadow-sm">
            <BsCurrencyRupee className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-semibold text-gray-800 truncate leading-tight group-hover:text-green-600 transition-colors duration-200">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-1">Amount Paid</span>
          </div>
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      type: "number",
      minWidth: 180,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-4 w-full group">
          <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl flex-shrink-0 group-hover:from-gray-100 group-hover:to-slate-200 transition-all duration-300 shadow-sm">
            <MdOutlineTrendingUp className="text-gray-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-semibold text-gray-800 truncate leading-tight group-hover:text-gray-700 transition-colors duration-200">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-1">Order Date</span>
          </div>
        </div>
      ),
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: formatIndianCurrency(item?.totalPrice),
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
      });
    });

  const orderStatusSummary = [
    {
      key: "unassigned",
      label: "Unassigned Orders",
      icon: "📅",
      count: adminOrders?.filter(order => order.status === "Unassigned").length || 0,
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      hoverGradient: "hover:from-blue-100 hover:to-blue-200"
    },
    {
      key: "accepted",
      label: "Accepted By Delivery Man",
      icon: "🧑‍✈️",
      count: adminOrders?.filter(order => order.status === "Accepted").length || 0,
      color: "text-teal-600",
      bgGradient: "from-teal-50 to-teal-100",
      hoverGradient: "hover:from-teal-100 hover:to-teal-200"
    },
    {
      key: "packaging",
      label: "Packaging",
      icon: "📦",
      count: adminOrders?.filter(order => order.status === "Packaging").length || 0,
      color: "text-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      hoverGradient: "hover:from-orange-100 hover:to-orange-200"
    },
    {
      key: "outForDelivery",
      label: "Out For Delivery",
      icon: "🚚",
      count: adminOrders?.filter(order => order.status === "Out For Delivery").length || 0,
      color: "text-green-600",
      bgGradient: "from-green-50 to-green-100",
      hoverGradient: "hover:from-green-100 hover:to-green-200"
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: "✅",
      count: adminOrders?.filter(order => order.status === "Delivered").length || 0,
      color: "text-green-700",
      bgGradient: "from-emerald-50 to-emerald-100",
      hoverGradient: "hover:from-emerald-100 hover:to-emerald-200"
    },
    {
      key: "canceled",
      label: "Canceled",
      icon: "❌",
      count: adminOrders?.filter(order => order.status === "Canceled").length || 0,
      color: "text-red-600",
      bgGradient: "from-red-50 to-red-100",
      hoverGradient: "hover:from-red-100 hover:to-red-200"
    },
    {
      key: "refunded",
      label: "Refunded",
      icon: "💸",
      count: adminOrders?.filter(order => order.status === "Refunded").length || 0,
      color: "text-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      hoverGradient: "hover:from-pink-100 hover:to-pink-200"
    },
    {
      key: "paymentFailed",
      label: "Payment Failed",
      icon: "💳",
      count: adminOrders?.filter(order => order.status === "Payment Failed").length || 0,
      color: "text-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      hoverGradient: "hover:from-yellow-100 hover:to-yellow-200"
    }
  ];

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          {/* Header Section with Enhanced Styling */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <span className="text-4xl">🛠️</span>
                </div>
                <div>
                  <div className="font-bold text-[32px] font-Poppins bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Admin Dashboard
                  </div>
                  <div className="text-gray-600 text-[18px] mt-1 font-medium">
                    Manage your admin tasks with powerful insights
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-xl"></div>
            </div>
            <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm text-gray-500 font-medium">Current Date</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-blue-100/50">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <span className="text-4xl">🛒</span>
              </div>
              <span className="text-base font-semibold text-gray-600 mb-2">Items</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{totalItemsCount}</span>
              <span className="text-sm text-gray-400">Total Items Sold</span>
            </div>

            <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-purple-100/50">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-4 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                <span className="text-4xl">🛍️</span>
              </div>
              <span className="text-base font-semibold text-gray-600 mb-2">Orders</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                {adminOrders && adminOrders.length}
              </span>
              <span className="text-sm text-gray-400">Total Orders</span>
            </div>

            <div className="group bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-green-100/50">
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <span className="text-4xl">🏪</span>
              </div>
              <span className="text-base font-semibold text-gray-600 mb-2">Grocery Stores</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
                {sellers && sellers.length}
              </span>
              <span className="text-sm text-gray-400">Total Stores</span>
            </div>

            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-orange-100/50">
              <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                <span className="text-4xl">👥</span>
              </div>
              <span className="text-base font-semibold text-gray-600 mb-2">Customers</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">{uniqueCustomers}</span>
              <span className="text-sm text-gray-400">Total Customers</span>
            </div>

            <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-emerald-100/50">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl mb-4 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                <span className="text-4xl">💰</span>
              </div>
              <span className="text-base font-semibold text-gray-600 mb-2">Total Earnings</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                {formatIndianCurrency(adminBalance)}
              </span>
              <span className="text-sm text-gray-400">0 Newly added</span>
            </div>
          </div>

          {/* Order Status Summary Cards - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {orderStatusSummary.map(status => (
              <div
                key={status.key}
                className={`flex items-center gap-3 bg-white rounded-lg shadow p-4 transition-transform hover:scale-105 border-l-4 w-full
                  ${
                    status.key === "unassigned" ? "border-blue-400" :
                    status.key === "accepted" ? "border-teal-400" :
                    status.key === "packaging" ? "border-orange-400" :
                    status.key === "outForDelivery" ? "border-green-400" :
                    status.key === "delivered" ? "border-green-600" :
                    status.key === "canceled" ? "border-red-400" :
                    status.key === "refunded" ? "border-pink-400" :
                    status.key === "paymentFailed" ? "border-yellow-400" : "border-gray-200"
                  }`}
                style={{ minHeight: 70 }}
              >
                <div className={`rounded-full p-2 text-xl bg-gray-100 ${status.color}`}>
                  {status.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">{status.label}</span>
                  <span className={`text-lg font-bold ${status.color}`}>{status.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Orders Table Section */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
              <h6 className="text-[28px] sm:text-[32px] font-Poppins font-bold flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <AiOutlineLineChart className="text-white" size={28} />
                </div>
                <span className="bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Latest Orders
                </span>
              </h6>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="w-full sm:w-[300px] pl-12 pr-6 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                  />
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <BsFilter size={20} />
                  <span className="text-sm font-semibold">Filter</span>
                </button>
              </div>
            </div>

            {/* Enhanced Data Grid Container */}
            <div className="w-full min-h-[65vh] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl border border-white/50">
              <style>
                {`
                  .custom-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                    color: #1e293b !important;
                    font-weight: 700 !important;
                    font-size: 0.875rem !important;
                    padding: 24px 20px !important;
                    border-bottom: 3px solid #e2e8f0 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    position: relative !important;
                  }
                  .custom-header::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
                  }
                  .custom-cell {
                    padding: 24px 20px !important;
                    font-size: 0.875rem !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                  }
                  .MuiDataGrid-row {
                    border-bottom: 1px solid #f1f5f9 !important;
                    transition: all 0.3s ease-in-out !important;
                    position: relative !important;
                  }
                  .MuiDataGrid-row:hover {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                    border-radius: 12px !important;
                    margin: 2px 8px !important;
                    border: 1px solid #e2e8f0 !important;
                  }
                  .MuiDataGrid-cell:focus {
                    outline: none !important;
                  }
                  .MuiDataGrid-columnSeparator {
                    display: none !important;
                  }
                  .MuiDataGrid-footerContainer {
                    border-top: 2px solid #e2e8f0 !important;
                    padding: 24px 20px !important;
                    margin-top: 12px !important;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                  }
                  .MuiTablePagination-root {
                    color: #64748b !important;
                  }
                  .MuiTablePagination-select {
                    color: #1e293b !important;
                    font-weight: 600 !important;
                    padding: 10px 18px !important;
                    border-radius: 8px !important;
                    background-color: #ffffff !important;
                  }
                  .MuiTablePagination-selectIcon {
                    color: #64748b !important;
                  }
                  .MuiIconButton-root {
                    color: #64748b !important;
                    transition: all 0.3s ease-in-out !important;
                    padding: 12px !important;
                    border-radius: 10px !important;
                  }
                  .MuiIconButton-root:hover {
                    background-color: #3b82f6 !important;
                    color: #ffffff !important;
                    transform: scale(1.1) !important;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
                  }
                  .MuiDataGrid-root {
                    border: none !important;
                    height: calc(65vh - 100px) !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                  }
                  .MuiDataGrid-columnHeaders {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                    border-bottom: 3px solid #e2e8f0 !important;
                  }
                  .MuiDataGrid-virtualScrollerContent {
                    padding: 8px !important;
                  }
                  .MuiDataGrid-cell {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    padding: 16px 20px !important;
                    height: 100% !important;
                    min-height: 80px !important;
                    border-bottom: none !important;
                  }
                  .MuiDataGrid-columnHeader {
                    padding: 20px !important;
                    height: 72px !important;
                    align-items: center !important;
                  }
                  .MuiDataGrid-columnHeaderTitle {
                    font-weight: 700 !important;
                    color: #1e293b !important;
                    white-space: normal !important;
                    line-height: 1.3 !important;
                    display: flex !important;
                    align-items: center !important;
                    text-transform: uppercase !important;
                    font-size: 0.8rem !important;
                    letter-spacing: 0.1em !important;
                  }
                  .MuiDataGrid-row {
                    min-height: 80px !important;
                  }
                  @media (max-width: 768px) {
                    .MuiDataGrid-cell {
                      padding: 12px !important;
                      min-height: 72px !important;
                    }
                    .MuiDataGrid-columnHeader {
                      padding: 12px !important;
                    }
                    .custom-cell {
                      font-size: 0.75rem !important;
                    }
                    .MuiDataGrid-row {
                      min-height: 72px !important;
                    }
                    .MuiDataGrid-columnHeaderTitle {
                      font-size: 0.7rem !important;
                    }
                  }
                `}
              </style>
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={6}
                disableSelectionOnClick
                autoHeight
                className="bg-white"
                componentsProps={{
                  pagination: {
                    className: "text-gray-700",
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardMain;
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
            <AiOutlineShoppingCart className="text-blue-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Order ID</span>
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
            bg: "bg-green-100",
            text: "text-green-800",
            icon: "✓",
            label: "Delivered"
          },
          Processing: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            icon: "⟳",
            label: "Processing"
          },
          Pending: {
            bg: "bg-blue-100",
            text: "text-blue-800",
            icon: "⏳",
            label: "Pending"
          },
          Cancelled: {
            bg: "bg-red-100",
            text: "text-red-800",
            icon: "✕",
            label: "Cancelled"
          }
        };
        const config = statusConfig[status] || statusConfig.Processing;
        return (
          <div className="flex items-center justify-center w-full">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${config.bg} ${config.text} flex items-center gap-2 min-w-[120px] justify-center`}>
              <span className="text-lg">{config.icon}</span>
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-purple-50 rounded-lg flex-shrink-0">
            <AiOutlineShoppingCart className="text-purple-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[80px]">
            <span className="font-medium text-gray-700 leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Total Items</span>
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
            <BsCurrencyRupee className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Amount Paid</span>
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-gray-50 rounded-lg flex-shrink-0">
            <MdOutlineTrendingUp className="text-gray-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Order Date</span>
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

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  🛠️
                </span>
                <div>
                  <div className="font-bold text-[28px] font-Poppins text-gray-900">
                    Admin Dashboard.
                  </div>
                  <div className="text-gray-600 text-[16px] mt-1">
                    Hello Here You Can Manage Your Admin Tasks.
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0">
              <p className="text-sm text-gray-600">Current Date</p>
              <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
          <div className="w-full block 800px:flex items-center justify-between gap-6">
            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl rounded-xl px-6 py-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <BsCurrencyRupee size={35} className="text-white" />
                </div>
                <h3 className="text-[20px] font-medium text-white ml-4">
                  Total Earnings
                </h3>
              </div>
              <h5 className="pt-6 pl-[36px] text-[32px] font-bold text-white">
                {formatIndianCurrency(adminBalance)}
              </h5>
              <div className="mt-6 flex items-center text-white/90 group">
                <span className="text-sm font-medium">View detailed earnings</span>
                <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-xl rounded-xl px-6 py-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <MdOutlinePeopleAlt size={35} className="text-white" />
                </div>
                <h3 className="text-[20px] font-medium text-white ml-4">
                  Active Sellers
                </h3>
              </div>
              <h5 className="pt-6 pl-[36px] text-[32px] font-bold text-white">
                {sellers && sellers.length}
              </h5>
              <Link to="/admin-sellers">
                <div className="mt-6 flex items-center text-white/90 group">
                  <span className="text-sm font-medium">View all sellers</span>
                  <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-xl rounded-xl px-6 py-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <AiOutlineShoppingCart size={35} className="text-white" />
                </div>
                <h3 className="text-[20px] font-medium text-white ml-4">
                  Total Orders
                </h3>
              </div>
              <h5 className="pt-6 pl-[36px] text-[32px] font-bold text-white">
                {adminOrders && adminOrders.length}
              </h5>
              <Link to="/admin-orders">
                <div className="mt-6 flex items-center text-white/90 group">
                  <span className="text-sm font-medium">View all orders</span>
                  <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h6 className="text-[24px] sm:text-[28px] font-Poppins text-gray-800 font-bold flex items-center gap-3">
                <AiOutlineLineChart className="text-blue-600" size={28} />
                Latest Orders
              </h6>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="w-full sm:w-[250px] pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <BsFilter size={18} />
                  <span className="text-sm font-medium">Filter</span>
                </button>
              </div>
            </div>
            <div className="w-full min-h-[65vh] bg-white rounded-xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
              <style>
                {`
                  .custom-header {
                    background-color: #f8fafc !important;
                    color: #1e293b !important;
                    font-weight: 600 !important;
                    font-size: 0.875rem !important;
                    padding: 20px 16px !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                  }
                  .custom-cell {
                    padding: 20px 16px !important;
                    font-size: 0.875rem !important;
                  }
                  .MuiDataGrid-row {
                    border-bottom: 1px solid #f1f5f9 !important;
                    transition: all 0.2s ease-in-out !important;
                  }
                  .MuiDataGrid-row:hover {
                    background-color: #f8fafc !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
                  }
                  .MuiDataGrid-cell:focus {
                    outline: none !important;
                  }
                  .MuiDataGrid-columnSeparator {
                    display: none !important;
                  }
                  .MuiDataGrid-footerContainer {
                    border-top: 1px solid #e2e8f0 !important;
                    padding: 20px 16px !important;
                    margin-top: 8px !important;
                  }
                  .MuiTablePagination-root {
                    color: #64748b !important;
                  }
                  .MuiTablePagination-select {
                    color: #1e293b !important;
                    font-weight: 500 !important;
                    padding: 8px 16px !important;
                  }
                  .MuiTablePagination-selectIcon {
                    color: #64748b !important;
                  }
                  .MuiIconButton-root {
                    color: #64748b !important;
                    transition: all 0.2s ease-in-out !important;
                    padding: 8px !important;
                  }
                  .MuiIconButton-root:hover {
                    background-color: #f1f5f9 !important;
                    color: #3b82f6 !important;
                  }
                  .status-delivered {
                    color: #059669 !important;
                  }
                  .status-processing {
                    color: #d97706 !important;
                  }
                  .MuiDataGrid-root {
                    border: none !important;
                    height: calc(65vh - 100px) !important;
                  }
                  .MuiDataGrid-columnHeaders {
                    background-color: #f8fafc !important;
                  }
                  .MuiDataGrid-virtualScroller {
                    margin-top: 0 !important;
                  }
                  .MuiDataGrid-virtualScrollerContent {
                    padding: 0 !important;
                  }
                  .MuiDataGrid-cell {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    padding: 12px 16px !important;
                    height: 100% !important;
                    min-height: 72px !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                  }
                  .MuiDataGrid-columnHeader {
                    padding: 16px !important;
                    height: 64px !important;
                    align-items: center !important;
                    background-color: #f8fafc !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                  }
                  .MuiDataGrid-columnHeaderTitle {
                    font-weight: 600 !important;
                    color: #1e293b !important;
                    white-space: normal !important;
                    line-height: 1.2 !important;
                    display: flex !important;
                    align-items: center !important;
                    text-transform: uppercase !important;
                    font-size: 0.75rem !important;
                    letter-spacing: 0.05em !important;
                  }
                  .MuiDataGrid-cellLeft {
                    justify-content: flex-start !important;
                  }
                  .MuiDataGrid-cellRight {
                    justify-content: flex-end !important;
                  }
                  .MuiDataGrid-cellCenter {
                    justify-content: center !important;
                  }
                  .MuiDataGrid-row {
                    min-height: 72px !important;
                  }
                  .MuiDataGrid-columnHeaders {
                    background-color: #f8fafc !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                  }
                  .MuiDataGrid-virtualScroller {
                    margin-top: 0 !important;
                  }
                  .MuiDataGrid-virtualScrollerContent {
                    padding: 0 !important;
                  }
                  .MuiDataGrid-columnSeparator {
                    display: none !important;
                  }
                  .MuiDataGrid-footerContainer {
                    border-top: 1px solid #e2e8f0 !important;
                    padding: 16px !important;
                  }
                  .MuiTablePagination-root {
                    color: #64748b !important;
                  }
                  .MuiTablePagination-select {
                    color: #1e293b !important;
                    font-weight: 500 !important;
                  }
                  .MuiTablePagination-selectIcon {
                    color: #64748b !important;
                  }
                  .MuiIconButton-root {
                    color: #64748b !important;
                    padding: 8px !important;
                  }
                  .MuiIconButton-root:hover {
                    background-color: #f1f5f9 !important;
                    color: #3b82f6 !important;
                  }
                  @media (max-width: 768px) {
                    .MuiDataGrid-cell {
                      padding: 8px !important;
                      min-height: 64px !important;
                    }
                    .MuiDataGrid-columnHeader {
                      padding: 12px 8px !important;
                    }
                    .custom-cell {
                      font-size: 0.75rem !important;
                    }
                    .MuiDataGrid-row {
                      min-height: 64px !important;
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

import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight, AiOutlineShoppingCart } from "react-icons/ai";
import { BsCurrencyRupee, BsFilter } from "react-icons/bs";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FiSearch } from "react-icons/fi";

const AllOrders = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllOrdersOfShop(seller._id));
    }, [dispatch]);

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
        {
            field: "Preview",
            flex: 0.8,
            minWidth: 100,
            headerName: "",
            type: "number",
            sortable: false,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <Link to={`/order/${params.id}`}>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300">
                        <span>View</span>
                        <AiOutlineArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            ),
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.cart.length,
                total: formatIndianCurrency(item.totalPrice),
                status: item.status,
                createdAt: item.createdAt.slice(0, 10),
            });
        });

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
                    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
                            <div>
                                <h6 className="text-[32px] font-Poppins text-gray-800 font-bold flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 rounded-lg">
                                        <AiOutlineShoppingCart className="text-blue-600" size={28} />
                                    </div>
                                    All Orders
                                </h6>
                                <p className="text-gray-600 mt-2 ml-1">Manage and monitor all orders</p>
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

                        <div className="w-full min-h-[75vh] bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 transform transition-all duration-300 hover:shadow-2xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative flex-1 sm:flex-none">
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            className="w-full sm:w-[300px] pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                                        <BsFilter size={18} />
                                        <span className="text-sm font-medium">Filter</span>
                                    </button>
                                </div>
                            </div>
                            {row.length === 0 ? (
                                <div className="w-full h-[400px] flex items-center justify-center">
                                    <div className="text-center">
                                        <AiOutlineShoppingCart className="mx-auto text-gray-400" size={48} />
                                        <p className="mt-4 text-gray-600">No orders found</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto">
                                    <DataGrid
                                        rows={row}
                                        columns={columns}
                                        pageSize={12}
                                        disableSelectionOnClick
                                        autoHeight
                                        className="!border-none !bg-white !rounded-lg w-full"
                                        componentsProps={{
                                            pagination: {
                                                className: "!text-gray-700",
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllOrders;
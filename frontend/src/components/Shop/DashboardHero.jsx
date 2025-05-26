import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect, AiOutlineShoppingCart, AiOutlineLineChart } from "react-icons/ai";
import { MdOutlineStorefront, MdOutlineTrendingUp, MdOutlinePeopleAlt, MdOutlineWavingHand } from "react-icons/md";
import { BsGraphUpArrow, BsCurrencyRupee, BsFilter } from "react-icons/bs";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import Loader from "../Layout/Loader";

const DashboardHero = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.products);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(getAllOrdersOfShop(seller._id));
        dispatch(getAllProductsShop(seller._id));
    }, [dispatch]);

    const availableBalance = seller?.availableBalance.toFixed(2);

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
            minWidth: 130,
            flex: 0.7,
            headerClassName: 'custom-header',
            cellClassName: (params) => {
                const status = params.getValue(params.id, "status");
                return `custom-cell ${status === "Delivered" ? "text-green-600" : "text-red-600"}`;
            },
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${params.value === "Delivered" ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="font-medium">{params.value}</span>
                </div>
            ),
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
        },
        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <span className="font-medium">{formatIndianCurrency(params.value)}</span>
            ),
        },
    ];

    const row = [];

    orders && orders.forEach((item) => {
        row.push({
            id: item._id,
            itemsQty: item.cart.length,
            total: item.totalPrice,
            status: item.status,
        });
    });

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
                        <div>
                            <h6 className="text-[32px] font-Poppins font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                <div className="p-2.5 bg-blue-50 rounded-lg">
                                    <MdOutlineWavingHand className="text-blue-600" size={28} />
                                </div>
                                Welcome, {seller?.name}
                            </h6>
                            <p className="text-gray-600 mt-2 ml-1">Here's what's happening with your store today.</p>
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
                                    Available Balance
                                </h3>
                            </div>
                            <h5 className="pt-6 pl-[36px] text-[32px] font-bold text-white">
                                {formatIndianCurrency(availableBalance)}
                            </h5>
                            <Link to="/dashboard-withdraw-money">
                                <div className="mt-6 flex items-center text-white/90 group">
                                    <span className="text-sm font-medium">Withdraw Money</span>
                                    <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>

                        <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-xl rounded-xl px-6 py-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-center">
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <AiOutlineShoppingCart size={35} className="text-white" />
                                </div>
                                <h3 className="text-[20px] font-medium text-white ml-4">
                                    Total Orders
                                </h3>
                            </div>
                            <h5 className="pt-6 pl-[36px] text-[32px] font-bold text-white">
                                {orders && orders.length}
                            </h5>
                            <Link to="/dashboard-orders">
                                <div className="mt-6 flex items-center text-white/90 group">
                                    <span className="text-sm font-medium">View all orders</span>
                                    <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>

                        <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-xl rounded-xl px-6 py-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-center">
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <MdOutlineStorefront size={35} className="text-white" />
                                </div>
                                <h3 className="text-[20px] font-medium text-white ml-4">
                                    Total Products
                                </h3>
                            </div>
                            <h5 className="pt-6 pl-[36px] text-[32px] font-bold text-white">
                                {products && products.length}
                            </h5>
                            <Link to="/dashboard-products">
                                <div className="mt-6 flex items-center text-white/90 group">
                                    <span className="text-sm font-medium">View all products</span>
                                    <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="w-full mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
                                <Link to="/dashboard-orders">
                                    <Button
                                        variant="contained"
                                        className="!bg-blue-500 hover:!bg-blue-600"
                                    >
                                        View All
                                    </Button>
                                </Link>
                            </div>
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

export default DashboardHero;
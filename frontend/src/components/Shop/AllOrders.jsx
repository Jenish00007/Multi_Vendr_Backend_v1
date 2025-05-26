import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight, AiOutlineShoppingCart } from "react-icons/ai";
import { BsCurrencyRupee } from "react-icons/bs";

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
                <div className="flex items-center gap-2">
                    <BsCurrencyRupee className="text-gray-600" size={16} />
                    <span className="font-medium">{formatIndianCurrency(params.value)}</span>
                </div>
            ),
        },
        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => {
                return (
                    <Link to={`/order/${params.id}`}>
                        <Button className="!bg-blue-500 hover:!bg-blue-600 text-white">
                            <AiOutlineArrowRight size={20} />
                        </Button>
                    </Link>
                );
            },
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
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
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">All Orders</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        className="w-[200px] pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <AiOutlineShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>
                        <DataGrid
                            rows={row}
                            columns={columns}
                            pageSize={10}
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
            )}
        </>
    );
};

export default AllOrders;
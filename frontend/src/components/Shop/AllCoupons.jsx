import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import { server } from "../../server";
import { toast } from "react-toastify";
import { MdOutlineLocalOffer } from "react-icons/md";
import { BsCurrencyRupee } from "react-icons/bs";

const AllCoupons = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [minAmount, setMinAmount] = useState(null);
    const [maxAmount, setMaxAmount] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [value, setValue] = useState(null);
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.products);

    const dispatch = useDispatch();

    useEffect(() => {
        fetchCoupons();
    }, [dispatch]);

    const fetchCoupons = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${server}/coupon/get-coupon/${seller._id}`, {
                withCredentials: true,
            });
            setCoupons(response.data.couponCodes);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Failed to fetch coupons");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${server}/coupon/delete-coupon/${id}`, { 
                withCredentials: true 
            });
            toast.success("Coupon code deleted successfully!");
            fetchCoupons(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting coupon:", error);
            toast.error("Failed to delete coupon");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${server}/coupon/create-coupon-code`,
                {
                    name,
                    minAmount,
                    maxAmount,
                    selectedProducts,
                    value,
                    shopId: seller._id,
                },
                { withCredentials: true }
            );
            toast.success("Coupon code created successfully!");
            setOpen(false);
            fetchCoupons(); // Refresh the list after creation
            // Reset form
            setName("");
            setMinAmount(null);
            setMaxAmount(null);
            setSelectedProducts(null);
            setValue(null);
        } catch (error) {
            console.error("Error creating coupon:", error);
            toast.error(error.response?.data?.message || "Failed to create coupon");
        }
    };

    const columns = [
        { 
            field: "id", 
            headerName: "Coupon ID", 
            minWidth: 180, 
            flex: 0.7,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 bg-orange-50 rounded-lg flex-shrink-0">
                        <MdOutlineLocalOffer className="text-orange-600" size={20} />
                    </div>
                    <div className="flex flex-col justify-center min-w-[100px]">
                        <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
                        <span className="text-xs text-gray-500 leading-tight mt-0.5">Coupon ID</span>
                    </div>
                </div>
            ),
        },
        {
            field: "name",
            headerName: "Coupon Code",
            minWidth: 180,
            flex: 1.4,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-600">{params.value}</span>
                    </div>
                </div>
            ),
        },
        {
            field: "value",
            headerName: "Value",
            minWidth: 100,
            flex: 0.6,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-600">{params.value}%</span>
                    </div>
                </div>
            ),
        },
        {
            field: "Delete",
            flex: 0.8,
            minWidth: 120,
            headerName: "",
            type: "number",
            sortable: false,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => {
                return (
                    <Button 
                        onClick={() => handleDelete(params.id)}
                        className="!bg-red-500 hover:!bg-red-600 text-white rounded-lg transition-all duration-300"
                    >
                        <AiOutlineDelete size={20} />
                    </Button>
                );
            },
        },
    ];

    const rows = coupons.map((item) => ({
        id: item._id,
        name: item.name,
        value: item.value,
    }));

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">All Coupons</h3>
                            <div
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-2"
                                onClick={() => setOpen(true)}
                            >
                                <MdOutlineLocalOffer size={20} />
                                <span>Create Coupon Code</span>
                            </div>
                        </div>
                        <DataGrid
                            rows={rows}
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
                        {open && (
                            <div className="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
                                <div className="w-[90%] 800px:w-[40%] h-[80vh] bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
                                    <div className="w-full flex justify-between items-center mb-6">
                                        <h5 className="text-2xl font-semibold text-gray-800">
                                            Create Coupon Code
                                        </h5>
                                        <RxCross1
                                            size={24}
                                            className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-300"
                                            onClick={() => setOpen(false)}
                                        />
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={name}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your coupon code name..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount Percentage <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={value}
                                                required
                                                min="1"
                                                max="100"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                onChange={(e) => setValue(e.target.value)}
                                                placeholder="Enter discount percentage (1-100)..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Min Amount
                                            </label>
                                            <input
                                                type="number"
                                                name="minAmount"
                                                value={minAmount}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                onChange={(e) => setMinAmount(e.target.value)}
                                                placeholder="Enter minimum amount..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Amount
                                            </label>
                                            <input
                                                type="number"
                                                name="maxAmount"
                                                value={maxAmount}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                onChange={(e) => setMaxAmount(e.target.value)}
                                                placeholder="Enter maximum amount..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Product
                                            </label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={selectedProducts}
                                                onChange={(e) => setSelectedProducts(e.target.value)}
                                            >
                                                <option value="">Choose a product</option>
                                                {products &&
                                                    products.map((i) => (
                                                        <option value={i.name} key={i.name}>
                                                            {i.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
                                            >
                                                Create Coupon
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AllCoupons;
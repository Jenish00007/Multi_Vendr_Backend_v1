import React, { useEffect } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePicture } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllBannersOfShop, deleteBanner } from "../../redux/actions/banner";
import Loader from "../Layout/Loader";
import { Link } from "react-router-dom";
import { backend_url } from "../../server";

const AllBanners = () => {
    const dispatch = useDispatch();
    const { seller } = useSelector((state) => state.seller);
    const { banners, isLoading } = useSelector((state) => state.banner);

    useEffect(() => {
        dispatch(getAllBannersOfShop(seller._id));
    }, [dispatch]);

    const handleDelete = (id) => {
        dispatch(deleteBanner(id));
        toast.success("Banner deleted successfully!");
    };

    const columns = [
        { 
            field: "id", 
            headerName: "Banner ID", 
            minWidth: 180, 
            flex: 0.8,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                        <AiOutlinePicture className="text-blue-600" size={20} />
                    </div>
                    <div className="flex flex-col justify-center min-w-[100px]">
                        <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
                        <span className="text-xs text-gray-500 leading-tight mt-0.5">Banner ID</span>
                    </div>
                </div>
            ),
        },
        {
            field: "image",
            headerName: "Image",
            minWidth: 100,
            flex: 0.7,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <img
                    src={`${backend_url}${params.row.image}`}
                    alt=""
                    className="w-[50px] h-[50px] object-cover rounded-lg"
                />
            ),
        },
        {
            field: "title",
            headerName: "Title",
            minWidth: 180,
            flex: 1.4,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
        },
        {
            field: "isActive",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${params.row.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`font-medium ${params.row.isActive ? "text-green-600" : "text-red-600"}`}>
                        {params.row.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
            ),
        },
        {
            field: "edit",
            flex: 0.8,
            minWidth: 100,
            headerName: "",
            type: "number",
            sortable: false,
            headerClassName: 'custom-header',
            cellClassName: 'custom-cell',
            renderCell: (params) => {
                return (
                    <Link to={`/dashboard-edit-banner/${params.id}`}>
                        <Button className="!bg-blue-500 hover:!bg-blue-600 text-white">
                            <AiOutlineEdit size={20} />
                        </Button>
                    </Link>
                );
            },
        },
        {
            field: "delete",
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
                        className="!bg-red-500 hover:!bg-red-600 text-white"
                    >
                        <AiOutlineDelete size={20} />
                    </Button>
                );
            },
        },
    ];

    const row = [];

    banners &&
        banners.forEach((item) => {
            row.push({
                id: item._id,
                image: item.image,
                title: item.title,
                isActive: item.isActive,
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
                            <h3 className="text-xl font-semibold text-gray-800">All Banners</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search banners..."
                                        className="w-[200px] pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <AiOutlinePicture className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                <Link to="/dashboard-create-banner">
                                    <Button
                                        variant="contained"
                                        className="!bg-blue-500 hover:!bg-blue-600"
                                    >
                                        Create Banner
                                    </Button>
                                </Link>
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

export default AllBanners; 
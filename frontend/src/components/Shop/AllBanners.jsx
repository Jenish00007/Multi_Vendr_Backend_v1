import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePicture } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllBannersOfShop, deleteBanner } from "../../redux/actions/banner";
import Loader from "../Layout/Loader";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { backend_url } from "../../server";

const AllBanners = () => {
    const dispatch = useDispatch();
    const { seller } = useSelector((state) => state.seller);
    const { banners, isLoading } = useSelector((state) => state.banner);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(getAllBannersOfShop(seller._id));
    }, [dispatch, seller._id]);

    const handleDelete = (id) => {
        dispatch(deleteBanner(id));
    };

    const filteredBanners = banners?.filter((banner) =>
        banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            field: "id",
            headerName: "Banner ID",
            minWidth: 150,
            flex: 0.7,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <AiOutlinePicture className="text-blue-500" />
                    <span className="text-gray-700">#{params.value ? params.value.slice(-6) : 'N/A'}</span>
                </div>
            ),
        },
        {
            field: "image",
            headerName: "Image",
            minWidth: 100,
            flex: 0.8,
            renderCell: (params) => (
                <div className="w-[50px] h-[50px] rounded-lg overflow-hidden">
                    <img
                        src={params.value}
                        alt={params.row.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/50";
                        }}
                    />
                </div>
            ),
        },
        {
            field: "title",
            headerName: "Title",
            minWidth: 180,
            flex: 1.4,
            renderCell: (params) => (
                <div className="font-medium text-gray-800 hover:text-blue-500 transition-colors duration-300">
                    {params.value || 'N/A'}
                </div>
            ),
        },
        {
            field: "description",
            headerName: "Description",
            minWidth: 200,
            flex: 1.4,
            renderCell: (params) => (
                <div className="text-gray-600">
                    {params.value ? (params.value.length > 50 ? `${params.value.substring(0, 50)}...` : params.value) : 'N/A'}
                </div>
            ),
        },
        {
            field: "link",
            headerName: "Link",
            minWidth: 150,
            flex: 1,
            renderCell: (params) => (
                <a
                    href={params.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 truncate"
                >
                    {params.value || 'N/A'}
                </a>
            ),
        },
        {
            field: "isActive",
            headerName: "Status",
            minWidth: 100,
            flex: 0.6,
            renderCell: (params) => (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {params.value ? 'Active' : 'Inactive'}
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
                title: item.title,
                description: item.description,
                image: item.image,
                link: item.link,
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
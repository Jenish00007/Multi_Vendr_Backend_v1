import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineDelete, AiOutlineEye, AiOutlineShop, AiOutlineMail, AiOutlinePhone, AiOutlineArrowRight, AiOutlinePlus } from "react-icons/ai";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllSellers } from "../../redux/actions/sellers";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import AddVendor from "./AddVendor";

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers = [], isLoading = true } = useSelector((state) => state.seller || {});
  const [open, setOpen] = useState(false);
  const [openAddVendor, setOpenAddVendor] = useState(false);
  const [userId, setUserId] = useState("");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  useEffect(() => {
    if (sellers && Array.isArray(sellers)) {
      const formattedRows = sellers
        .filter(item => item && item._id)
        .map(item => ({
          id: item._id,
          name: item.name || 'N/A',
          email: item.email || 'N/A',
          phoneNumber: item.phoneNumber || 'N/A',
          status: item.status || 'inactive',
          avatar: item.avatar || null,
        }));
      setRows(formattedRows);
    }
  }, [sellers]);

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

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${server}/shop/delete-seller/${id}`, { withCredentials: true });
      toast.success(res.data.message);
      dispatch(getAllSellers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting seller");
    }
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Shop ID", 
      minWidth: 150,
      flex: 1,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
            <AiOutlineShop className="text-blue-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">#{params.row.id.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Shop ID</span>
          </div>
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 200,
      flex: 1.5,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-purple-50 flex-shrink-0">
            <img
              src={params.row.avatar}
              alt={params.row.name}
              className="w-full h-full object-cover"
             
            />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.row.name}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Shop Name</span>
          </div>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 250,
      flex: 2,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
            <AiOutlineMail className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[180px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.row.email}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Email Address</span>
          </div>
        </div>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      minWidth: 180,
      flex: 1,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-orange-50 rounded-lg flex-shrink-0">
            <AiOutlinePhone className="text-orange-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.row.phoneNumber}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Contact Number</span>
          </div>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center justify-start w-full">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            params.row.status === "active" 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {params.row.status || "inactive"}
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-start gap-2 w-full">
            <Link to={`/shop/preview/${params.row.id}`}>
              <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300">
                <AiOutlineEye size={18} />
              </button>
            </Link>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
              onClick={() => {
                setUserId(params.row.id);
                setOpen(true);
              }}
            >
              <AiOutlineDelete size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
          <div>
            <h6 className="text-[32px] font-Poppins font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <AiOutlineShop className="text-blue-600" size={28} />
              </div>
              All Sellers
            </h6>
            <p className="text-gray-600 mt-2 ml-1">Manage and monitor all registered sellers</p>
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
                  placeholder="Search sellers..."
                  className="w-full sm:w-[300px] pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <BsFilter size={18} />
                <span className="text-sm font-medium">Filter</span>
              </button>
            </div>
            <button
              onClick={() => setOpenAddVendor(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <AiOutlinePlus size={18} />
              <span className="text-sm font-medium">Add Vendor</span>
            </button>
          </div>
          {rows.length === 0 ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-center">
                <AiOutlineShop className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-gray-600">No sellers found</p>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <DataGrid
                rows={rows}
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
      {open && (
        <div className="w-full fixed top-0 left-0 z-[999] bg-[#00000039] flex items-center justify-center h-screen">
          <div className="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded-lg shadow-lg p-8">
            <div className="w-full flex justify-end cursor-pointer">
              <RxCross1 size={25} onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700" />
            </div>
            <h3 className="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">
              Are you sure you want to delete this seller?
            </h3>
            <div className="w-full flex items-center justify-center gap-4">
              <button
                className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
                onClick={() => {
                  setOpen(false);
                  handleDelete(userId);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {openAddVendor && <AddVendor setOpen={setOpenAddVendor} />}
    </div>
  );
};

export default AllSellers;

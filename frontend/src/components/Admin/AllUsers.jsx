import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineDelete, AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineArrowRight } from "react-icons/ai";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${server}/user/delete-user/${id}`, {
        withCredentials: true,
      });
      toast.success("User deleted successfully!");
      dispatch(getAllUsers());
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const columns = [
    { 
      field: "id", 
      headerName: "User ID", 
      minWidth: 180,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
            <AiOutlineUser className="text-blue-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">User ID</span>
          </div>
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-purple-50 rounded-lg flex-shrink-0">
            <AiOutlineUser className="text-purple-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Full Name</span>
          </div>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 180,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
            <AiOutlineMail className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[180px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Email Address</span>
          </div>
        </div>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      minWidth: 180,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-orange-50 rounded-lg flex-shrink-0">
            <AiOutlinePhone className="text-orange-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Contact Number</span>
          </div>
        </div>
      ),
    },
    {
      field: " ",
      headerName: "Actions",
      type: "number",
      minWidth: 130,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-end gap-2 w-full">
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

  const row = [];
  users &&
    users.forEach((item) => {
      row.push({
        id: item._id || '',
        name: item.name || 'N/A',
        email: item.email || 'N/A',
        phoneNumber: item.phoneNumber || 'N/A',
      });
    });

  return (
    <div className="w-full min-h-[75vh] bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 transform transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AiOutlineUser className="text-blue-600" size={24} />
            All Users
          </h1>
          <p className="text-gray-500 mt-1">Manage and monitor all registered users</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search users..."
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
            <AiOutlineUser className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600">No users found</p>
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
      {open && (
        <div className="w-full fixed top-0 left-0 z-[999] bg-[#00000039] flex items-center justify-center h-screen">
          <div className="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded-lg shadow-lg p-8">
            <div className="w-full flex justify-end cursor-pointer">
              <RxCross1 size={25} onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700" />
            </div>
            <h3 className="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">
              Are you sure you want to delete this user?
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
                onClick={() => setOpen(false) || handleDelete(userId)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;

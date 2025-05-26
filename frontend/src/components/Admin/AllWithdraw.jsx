import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { BsPencil, BsCurrencyDollar, BsShop, BsClock, BsCheckCircle } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { toast } from "react-toastify";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState();
  const [withdrawStatus, setWithdrawStatus] = useState("Processing");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await axios.get(`${server}/withdraw/get-all-withdraw-request`, {
          withCredentials: true,
        });
        if (res.data && res.data.withdraws) {
          setData(res.data.withdraws);
        }
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        toast.error("Failed to fetch withdrawal requests");
      }
    };
    fetchWithdrawals();
  }, []);

  const columns = [
    { 
      field: "id", 
      headerName: "Withdraw ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <BsCurrencyDollar className="text-green-500" />
          <span className="text-gray-700">#{params.value ? params.value.slice(-6) : 'N/A'}</span>
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 180,
      flex: 1.4,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <BsShop className="text-blue-500" />
          <span className="font-medium text-gray-800 hover:text-blue-500 transition-colors duration-300">
            {params.value || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      field: "shopId",
      headerName: "Shop ID",
      minWidth: 180,
      flex: 1.4,
      renderCell: (params) => (
        <span className="text-gray-600">#{params.value ? params.value.slice(-6) : 'N/A'}</span>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <div className="flex items-center gap-2 text-green-600 font-bold">
          <BsCurrencyDollar />
          {params.value || 'N/A'}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => {
        const status = params.value || 'Processing';
        const statusConfig = {
          Processing: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            icon: <BsClock className="text-yellow-500" />,
          },
          Succeed: {
            bg: "bg-green-100",
            text: "text-green-800",
            icon: <BsCheckCircle className="text-green-500" />,
          },
        };
        const config = statusConfig[status] || statusConfig.Processing;
        return (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.text}`}>
            {config.icon}
            <span className="font-medium">{status}</span>
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Request Date",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      renderCell: (params) => (
        <div className="text-gray-600">
          {params.value || 'N/A'}
        </div>
      ),
    },
    {
      field: " ",
      headerName: "Update Status",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      renderCell: (params) => {
        return (
          <button
            className={`p-2 rounded-lg ${
              params.row.status !== "Processing" 
                ? "hidden" 
                : "bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
            }`}
            onClick={() => {
              setWithdrawData(params.row);
              setOpen(true);
            }}
          >
            <BsPencil size={20} />
          </button>
        );
      },
    },
  ];

  const handleSubmit = async () => {
    if (!withdrawData) return;

    try {
      const res = await axios.put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        {
          sellerId: withdrawData.shopId,
        },
        { withCredentials: true }
      );
      
      if (res.data && res.data.withdraws) {
        setData(res.data.withdraws);
        toast.success("Withdraw request updated successfully!");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      toast.error("Failed to update withdrawal request");
    }
  };

  const row = [];

  data &&
    data.forEach((item) => {
      if (item && item.seller) {
        row.push({
          id: item._id || '',
          shopId: item.seller._id || '',
          name: item.seller.name || 'N/A',
          amount: item.amount ? "US$ " + item.amount : 'N/A',
          status: item.status || 'Processing',
          createdAt: item.createdAt ? item.createdAt.slice(0, 10) : 'N/A',
        });
      }
    });

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BsCurrencyDollar className="text-green-500" />
          Withdraw Requests
        </h1>
        <p className="text-gray-500 mt-1">Manage and process seller withdrawal requests</p>
      </div>
      <DataGrid
        rows={row}
        columns={columns}
        pageSize={10}
        disableSelectionOnClick
        autoHeight
        className="!border-none"
        componentsProps={{
          pagination: {
            className: "!text-gray-700",
          },
        }}
      />

      {open && withdrawData && (
        <div className="w-full fixed h-screen top-0 left-0 bg-[#00000031] z-[9999] flex items-center justify-center">
          <div className="w-[50%] min-h-[40vh] bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Update Withdraw Status</h1>
              <RxCross1 
                size={25} 
                onClick={() => setOpen(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-300"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <select
                onChange={(e) => setWithdrawStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={withdrawStatus}
              >
                <option value="Processing">Processing</option>
                <option value="Succeed">Succeed</option>
              </select>
            </div>

            <button
              type="submit"
              className={`${styles.button} w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300`}
              onClick={handleSubmit}
            >
              Update Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;

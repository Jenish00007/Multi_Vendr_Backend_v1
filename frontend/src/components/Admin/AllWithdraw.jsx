import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { BsPencil, BsCurrencyDollar, BsShop, BsClock, BsCheckCircle, BsEye } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { toast } from "react-toastify";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState();
  const [withdrawStatus, setWithdrawStatus] = useState("Processing");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);

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

  const handlePreview = (withdraw) => {
    setSelectedWithdraw(withdraw);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedWithdraw(null);
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Withdraw ID", 
      minWidth: 150, 
      flex: 0.7,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
            <BsCurrencyDollar className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Withdraw ID</span>
          </div>
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 180,
      flex: 1.4,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
            <BsShop className="text-blue-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Shop Name</span>
          </div>
        </div>
      ),
    },
    {
      field: "shopId",
      headerName: "Shop ID",
      minWidth: 180,
      flex: 1.4,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-purple-50 rounded-lg flex-shrink-0">
            <BsShop className="text-purple-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Shop ID</span>
          </div>
        </div>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 100,
      flex: 0.6,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
            <BsCurrencyDollar className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Amount</span>
          </div>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
      minWidth: 80,
      flex: 0.5,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
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
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-gray-50 rounded-lg flex-shrink-0">
            <BsClock className="text-gray-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Request Date</span>
          </div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreview(params.row)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
          >
            <span>View</span>
            <BsEye className="transform group-hover:translate-x-1 transition-transform" />
          </button>
          {params.row.status === "Processing" && (
            <button
              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-300"
              onClick={() => {
                setWithdrawData(params.row);
                setOpen(true);
              }}
            >
              <BsPencil size={20} />
            </button>
          )}
        </div>
      ),
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
          amount: formatIndianCurrency(item.amount || 0),
          status: item.status || 'Processing',
          createdAt: item.createdAt ? item.createdAt.slice(0, 10) : 'N/A',
          ...item // Include all withdraw data for the modal
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

      {/* Withdraw Preview Modal */}
      {isPreviewOpen && selectedWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Withdraw Details</h2>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RxCross1 size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Withdraw Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Withdraw Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Withdraw ID:</span>
                      <span className="font-medium">#{selectedWithdraw.id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{selectedWithdraw.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-3 py-1 rounded-full ${
                        selectedWithdraw.status === 'Succeed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedWithdraw.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request Date:</span>
                      <span className="font-medium">{selectedWithdraw.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shop Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shop ID:</span>
                      <span className="font-medium">#{selectedWithdraw.shopId.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shop Name:</span>
                      <span className="font-medium">{selectedWithdraw.name}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Bank Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium">{selectedWithdraw.bankName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium">{selectedWithdraw.bankAccountNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-medium">{selectedWithdraw.bankIfscCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
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

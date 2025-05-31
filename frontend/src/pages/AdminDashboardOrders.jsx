import React, { useState, useEffect } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../redux/actions/order";
import { AiOutlineShoppingCart, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { MdOutlineTrendingUp } from "react-icons/md";
import { BsCurrencyRupee, BsFilter } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import Loader from "../components/Layout/Loader";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, [dispatch]);

  const handlePreview = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

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
            bg: "bg-green-100",
            text: "text-green-800",
            icon: "✓",
            label: "Delivered"
          },
          Processing: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            icon: "⟳",
            label: "Processing"
          },
          Pending: {
            bg: "bg-blue-100",
            text: "text-blue-800",
            icon: "⏳",
            label: "Pending"
          },
          Cancelled: {
            bg: "bg-red-100",
            text: "text-red-800",
            icon: "✕",
            label: "Cancelled"
          }
        };
        const config = statusConfig[status] || statusConfig.Processing;
        return (
          <div className="flex items-center justify-center w-full">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${config.bg} ${config.text} flex items-center gap-2 min-w-[120px] justify-center`}>
              <span className="text-lg">{config.icon}</span>
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-purple-50 rounded-lg flex-shrink-0">
            <AiOutlineShoppingCart className="text-purple-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[80px]">
            <span className="font-medium text-gray-700 leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Total Items</span>
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
            <BsCurrencyRupee className="text-green-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Amount Paid</span>
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
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-gray-50 rounded-lg flex-shrink-0">
            <MdOutlineTrendingUp className="text-gray-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="font-medium text-gray-700 truncate leading-tight">{params.value}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Order Date</span>
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
        <button
          onClick={() => handlePreview(params.row)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
        >
          <span>View</span>
          <AiOutlineArrowRight className="transform group-hover:translate-x-1 transition-transform" />
        </button>
      ),
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: formatIndianCurrency(item?.totalPrice),
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
        ...item // Include all order data for the modal
      });
    });

  return (
    <div>
      <AdminHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
      <div className="w-full flex">
        <div className="flex items-start w-full">
          <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
            <AdminSideBar active={4} openSidebar={openSidebar} />
          </div>
          <div className="w-full">
            {adminOrderLoading ? (
              <Loader />
            ) : (
              <div className="w-full p-4">
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
            )}
          </div>
        </div>
      </div>

      {/* Order Preview Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Order Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{selectedOrder.id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-3 py-1 rounded-full ${
                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        selectedOrder.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedOrder.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedOrder.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedOrder.user?.phoneNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.cart?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images[0].url || item.images[0] || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/64?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <AiOutlineShoppingCart className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                          <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-right">{selectedOrder.shippingAddress?.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{selectedOrder.shippingAddress?.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">{selectedOrder.shippingAddress?.state || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span className="font-medium">{selectedOrder.shippingAddress?.country || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zip Code:</span>
                      <span className="font-medium">{selectedOrder.shippingAddress?.zipCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardOrders;

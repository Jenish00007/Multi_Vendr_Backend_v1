import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineShopping, AiOutlineDollar, AiOutlineStock, AiOutlineFire, AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { deleteProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import axios from "axios";
import { server } from "../../server";
import { FiSearch } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import { BsCurrencyRupee } from "react-icons/bs";

const AllProducts = () => {
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${server}/product/admin-all-products`, { withCredentials: true })
      .then((res) => {
        setData(res.data.products);
      });
  }, []);

  const handlePreview = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
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
      headerName: "Product ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <AiOutlineShopping className="text-blue-500" />
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
            alt={params.row.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/50";
            }}
          />
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 1.4,
      renderCell: (params) => (
        <div className="font-medium text-gray-800 hover:text-blue-500 transition-colors duration-300">
          {params.value || 'N/A'}
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <BsCurrencyRupee />
          {params.value || 'N/A'}
        </div>
      ),
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <AiOutlineStock className="text-orange-500" />
          <span className={params.value < 10 ? "text-red-500 font-medium" : "text-gray-700"}>
            {params.value || 0}
          </span>
        </div>
      ),
    },
    {
      field: "sold",
      headerName: "Sold",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      renderCell: (params) => (
        <div className="flex items-center gap-2 text-orange-500">
          <AiOutlineFire />
          <span className="font-medium">{params.value || 0}</span>
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
      renderCell: (params) => (
        <Button 
          onClick={() => handlePreview(params.row)}
          className="!bg-blue-500 !text-white hover:!bg-blue-600 transition-colors duration-300"
        >
          <AiOutlineEye size={20} />
        </Button>
      ),
    },
  ];

  const row = [];

  data &&
    data.forEach((item) => {
      row.push({
        id: item._id || '',
        name: item.name || 'N/A',
        price: item.discountPrice,
        Stock: item.stock || 0,
        sold: item?.sold_out || 0,
        image: item.images?.[0] || item.image,
        description: item.description,
        category: item.category,
        tags: Array.isArray(item.tags) ? item.tags : [],
        originalPrice: item.originalPrice,
        images: item.images,
      });
    });

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
          <div>
            <h6 className="text-[32px] font-Poppins text-gray-800 font-bold flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <AiOutlineShopping className="text-blue-600" size={28} />
              </div>
              All Products
            </h6>
            <p className="text-gray-600 mt-2 ml-1">Manage and monitor all products</p>
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
                  placeholder="Search products..."
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
                <AiOutlineShopping className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-gray-600">No products found</p>
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

      {/* Product Preview Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Product Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${selectedProduct.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">Category: {selectedProduct.category}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">{formatIndianCurrency(selectedProduct.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Price:</span>
                    <span className="font-medium text-green-600">{formatIndianCurrency(selectedProduct.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">{selectedProduct.Stock} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sold:</span>
                    <span className="font-medium">{selectedProduct.sold} units</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                </div>

                {selectedProduct.tags && Array.isArray(selectedProduct.tags) && selectedProduct.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;

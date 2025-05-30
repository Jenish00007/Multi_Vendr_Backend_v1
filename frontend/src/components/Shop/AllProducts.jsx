import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineShopping, AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteProduct, getAllProductsShop } from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import { BsCurrencyRupee } from "react-icons/bs";

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProductsShop(seller._id));
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    window.location.reload();
  };

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
      minWidth: 180, 
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => (
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
            <AiOutlineShopping className="text-blue-600" size={20} />
          </div>
          <div className="flex flex-col justify-center min-w-[100px]">
            <span className="font-medium text-gray-700 truncate leading-tight">#{params.value.slice(-6)}</span>
            <span className="text-xs text-gray-500 leading-tight mt-0.5">Product ID</span>
          </div>
        </div>
      ),
    },
    {
      field: "image",
      headerName: "Image",
      minWidth: 100,
      flex: 0.8,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
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
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
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
      field: "stock",
      headerName: "Stock",
      type: "number",
      minWidth: 80,
      flex: 0.5,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
    },
    {
      field: "sold_out",
      headerName: "Sold out",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
    },
    {
      field: "preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "",
      type: "number",
      sortable: false,
      headerClassName: 'custom-header',
      cellClassName: 'custom-cell',
      renderCell: (params) => {
        return (
          <Button 
            onClick={() => handlePreview(params.row)}
            className="!bg-blue-500 hover:!bg-blue-600 text-white"
          >
            <AiOutlineEye size={20} />
          </Button>
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

  products &&
    products.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: item.discountPrice,
        stock: item.stock,
        sold_out: item.sold_out,
        image: item.images?.[0] || "https://via.placeholder.com/50",
        description: item.description,
        category: item.category,
        tags: item.tags,
        originalPrice: item.originalPrice,
        images: item.images,
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
              <h3 className="text-xl font-semibold text-gray-800">All Products</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-[200px] pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <AiOutlineShopping className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <Link to="/dashboard-create-product">
                  <Button
                    variant="contained"
                    className="!bg-blue-500 hover:!bg-blue-600"
                  >
                    Create Product
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
                        <span className="font-medium">{selectedProduct.stock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-medium">{selectedProduct.sold_out} units</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                    </div>

                    {selectedProduct.tags && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.tags.split(',').map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                            >
                              {tag.trim()}
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
      )}
    </>
  );
};

export default AllProducts;

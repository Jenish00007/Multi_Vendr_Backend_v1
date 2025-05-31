import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
  getAllAdminBanners, 
  deleteAdminBanner,
  createAdminBanner,
  updateAdminBanner 
} from "../../redux/actions/adminBanner";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineAppstore } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import { server } from "../../server";
import Loader from "../Layout/Loader";

const AdminBannersPage = () => {
  const dispatch = useDispatch();
  const { banners, loading } = useSelector((state) => state.adminBanner);
  const [open, setOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: null,
  });

  useEffect(() => {
    dispatch(getAllAdminBanners());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedBanner) {
        await dispatch(updateAdminBanner({ 
          id: selectedBanner._id, 
          formData: formDataToSend 
        }));
      } else {
        await dispatch(createAdminBanner(formDataToSend));
      }

      setOpen(false);
      setSelectedBanner(null);
      setFormData({
        title: "",
        description: "",
        link: "",
        image: null,
      });
    } catch (error) {
      toast.error(error.message || "Error saving banner");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAdminBanner(id));
      await dispatch(getAllAdminBanners());
    } catch (error) {
      toast.error(error.message || "Error deleting banner");
    }
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      link: banner.link || "",
      image: null,
    });
    setOpen(true);
  };

  const columns = [
    {
      field: "id",
      headerName: "Banner ID",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <AiOutlineAppstore className="text-blue-500" />
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
            alt={params?.row.title}
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
      flex: 1.2,
      renderCell: (params) => (
        <div className="text-gray-600">
          {params.value || 'N/A'}
        </div>
      ),
    },
    {
      field: "link",
      headerName: "Link",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div className="text-gray-600">
          {params.value || 'N/A'}
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <div className="text-gray-600">
          {new Date(params.value).toLocaleDateString()}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleEdit(params.row)}
            className="!bg-blue-500 !text-white hover:!bg-blue-600 transition-colors duration-300"
          >
            <AiOutlineEdit size={20} />
          </Button>
          <Button
            onClick={() => handleDelete(params.row._id)}
            className="!bg-red-500 !text-white hover:!bg-red-600 transition-colors duration-300"
          >
            <AiOutlineDelete size={20} />
          </Button>
        </div>
      ),
    },
  ];

  const rows = banners?.map((banner) => ({
    id: banner._id,
    _id: banner._id,
    title: banner.title,
    description: banner.description,
    link: banner.link,
    image: banner.image,
    createdAt: banner.createdAt,
    tags: Array.isArray(banner.tags) ? banner.tags : [],
  })) || [];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
          <div>
            <h6 className="text-[32px] font-Poppins text-gray-800 font-bold flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <AiOutlineAppstore className="text-blue-600" size={28} />
              </div>
              All Banners
            </h6>
            <p className="text-gray-600 mt-2 ml-1">Manage and monitor all banners</p>
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
                  placeholder="Search banners..."
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
              onClick={() => {
                setSelectedBanner(null);
                setFormData({ title: "", description: "", link: "", image: null });
                setOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              <AiOutlineAppstore size={18} />
              <span className="text-sm font-medium">Add New Banner</span>
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-center">
                <AiOutlineAppstore className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-gray-600">No banners found</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {selectedBanner ? "Edit Banner" : "Add New Banner"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required={!selectedBanner}
                />
                {selectedBanner && (
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to keep current image
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {selectedBanner ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage; 
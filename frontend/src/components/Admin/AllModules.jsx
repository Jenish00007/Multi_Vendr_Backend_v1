import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import { server } from "../../server";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "../Layout/Loader";

const AllModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/modules`, {
        withCredentials: true,
      });
      setModules(response.data.data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || "Error fetching modules");
      setModules([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (selectedModule) {
        await axios.put(
          `${server}/modules/${selectedModule._id}`,
          formDataToSend,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success("Module updated successfully!");
      } else {
        await axios.post(`${server}/modules`, formDataToSend, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Module created successfully!");
      }
      setOpen(false);
      setSelectedModule(null);
      setFormData({ name: "", description: "", image: null });
      fetchModules();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || "Error saving module");
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${server}/modules/${id}`, {
        withCredentials: true,
      });
      toast.success("Module deleted successfully!");
      fetchModules();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || "Error deleting module");
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Module ID",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <AiOutlinePlus className="text-blue-500" />
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
            onClick={() => {
              setSelectedModule(params.row);
              setFormData({
                name: params.row.name,
                description: params.row.description,
              });
              setOpen(true);
            }}
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

  const rows = modules?.map((module) => ({
    id: module._id,
    _id: module._id,
    name: module.name,
    description: module.description,
    image: module.image,
    createdAt: module.createdAt,
  })) || [];

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
          <div>
            <h6 className="text-[32px] font-Poppins text-gray-800 font-bold flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <AiOutlinePlus className="text-blue-600" size={28} />
              </div>
              All Modules
            </h6>
            <p className="text-gray-600 mt-2 ml-1">Manage and monitor all modules</p>
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
                  placeholder="Search modules..."
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
                setSelectedModule(null);
                setFormData({ name: "", description: "", image: null });
                setOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              <AiOutlinePlus size={18} />
              <span className="text-sm font-medium">Add New Module</span>
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-center">
                <AiOutlinePlus className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-gray-600">No modules found</p>
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
              {selectedModule ? "Edit Module" : "Add New Module"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  accept="image/*"
                  required={!selectedModule}
                />
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
                  {selectedModule ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllModules; 
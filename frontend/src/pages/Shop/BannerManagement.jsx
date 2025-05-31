import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { Button, Input, Modal, Table, Switch, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const BannerManagement = () => {
  const { seller } = useSelector((state) => state.seller);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: null,
  });

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/shop-banners/all`, {
        withCredentials: true,
      });
      setBanners(data.banners);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (editingBanner) {
        await axios.put(
          `${server}/shop-banners/${editingBanner._id}`,
          formDataToSend,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Banner updated successfully");
      } else {
        await axios.post(`${server}/shop-banners/create`, formDataToSend, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Banner created successfully");
      }

      setIsModalVisible(false);
      setEditingBanner(null);
      setFormData({
        title: "",
        description: "",
        link: "",
        image: null,
      });
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving banner");
    }
  };

  // Handle banner deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${server}/shop-banners/${id}`, {
        withCredentials: true,
      });
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting banner");
    }
  };

  // Handle banner edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      link: banner.link,
      image: null,
    });
    setIsModalVisible(true);
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);

    // Update order in backend
    try {
      await axios.put(
        `${server}/shop-banners/${reorderedItem._id}`,
        { order: result.destination.index },
        { withCredentials: true }
      );
    } catch (error) {
      toast.error("Error updating banner order");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img
          src={image}
          alt="Banner"
          style={{ width: "100px", height: "60px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={async (checked) => {
            try {
              await axios.put(
                `${server}/shop-banners/${record._id}`,
                { isActive: checked },
                { withCredentials: true }
              );
              fetchBanners();
            } catch (error) {
              toast.error("Error updating banner status");
            }
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBanner(null);
            setFormData({
              title: "",
              description: "",
              link: "",
              image: null,
            });
            setIsModalVisible(true);
          }}
        >
          Add New Banner
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="banners">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Table
                columns={columns}
                dataSource={banners}
                rowKey="_id"
                loading={loading}
                pagination={false}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        title={editingBanner ? "Edit Banner" : "Add New Banner"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBanner(null);
          setFormData({
            title: "",
            description: "",
            link: "",
            image: null,
          });
        }}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <Input.TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-2">Link</label>
            <Input
              name="link"
              value={formData.link}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-2">Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editingBanner}
            />
            {editingBanner && (
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to keep current image
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingBanner ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BannerManagement; 
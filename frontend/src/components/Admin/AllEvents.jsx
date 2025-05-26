import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineCalendar, AiOutlineDollar, AiOutlineStock, AiOutlineFire, AiOutlineGift } from "react-icons/ai";
import { Link } from "react-router-dom";
import { server } from "../../server";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    axios
      .get(`${server}/event/admin-all-events`, { withCredentials: true })
      .then((res) => {
        setEvents(res.data.events);
      });
  }, []);

  const columns = [
    { 
      field: "id", 
      headerName: "Event ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <AiOutlineGift className="text-purple-500" />
          <span className="text-gray-700">#{params.value ? params.value.slice(-6) : 'N/A'}</span>
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 1.4,
      renderCell: (params) => (
        <div className="font-medium text-gray-800 hover:text-purple-500 transition-colors duration-300">
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
          <AiOutlineDollar />
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
        <Link to={`/product/${params.id}?isEvent=true`}>
          <Button className="!bg-purple-500 !text-white hover:!bg-purple-600 transition-colors duration-300">
            <AiOutlineEye size={20} />
          </Button>
        </Link>
      ),
    },
  ];

  const row = [];

  events &&
    events.forEach((item) => {
      row.push({
        id: item._id || '',
        name: item.name || 'N/A',
        price: item.discountPrice ? "US$ " + item.discountPrice : 'N/A',
        Stock: item.stock || 0,
        sold: item.sold_out || 0,
      });
    });

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AiOutlineCalendar className="text-purple-500" />
          All Events
        </h1>
        <p className="text-gray-500 mt-1">Manage and monitor all promotional events</p>
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
    </div>
  );
};

export default AllEvents;

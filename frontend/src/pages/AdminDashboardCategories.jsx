import React, { useState } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllCategories from "../components/Admin/AllCategories";

const AdminDashboardCategories = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div>
      <AdminHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
      <div className="w-full flex">
        <div className="flex items-start w-full">
          <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
            <AdminSideBar active={10} openSidebar={openSidebar} />
          </div>
          <div className="w-full">
            <AllCategories />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardCategories; 
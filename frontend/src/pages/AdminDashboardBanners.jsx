import React, { useState } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminBannersPage from "../components/Admin/AdminBannersPage";

const AdminDashboardBanners = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div>
      <AdminHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
      <div className="w-full flex">
        <div className="flex items-start w-full">
          <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
            <AdminSideBar active={12} openSidebar={openSidebar} />
          </div>
          <div className="w-full">
            <AdminBannersPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardBanners; 
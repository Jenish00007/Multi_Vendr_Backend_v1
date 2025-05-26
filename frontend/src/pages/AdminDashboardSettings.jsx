import React, { useState } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminSettings from "../components/Admin/AdminSettings";

const AdminDashboardSettings = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div>
      <AdminHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
      <div className="w-full flex">
        <div className="flex items-start w-full">
          <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
            <AdminSideBar active={8} openSidebar={openSidebar} />
          </div>
          <div className="w-full">
            <AdminSettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSettings; 
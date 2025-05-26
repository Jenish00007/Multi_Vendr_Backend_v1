import React, { useState } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain.jsx";

const AdminDashboardPage = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div>
      <AdminHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
            <AdminSideBar active={1} openSidebar={openSidebar} />
          </div>
          <AdminDashboardMain />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

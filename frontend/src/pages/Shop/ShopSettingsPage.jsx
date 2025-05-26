import React, { useState } from "react";
import ShopSettings from "../../components/Shop/ShopSettings";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";

const ShopSettingsPage = () => {
    const [openSidebar, setOpenSidebar] = useState(false);

    return (
        <div>
            <DashboardHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
            <div className="flex items-start justify-between w-full">
                <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
                    <DashboardSideBar active={10} openSidebar={openSidebar} />
                </div>
                <ShopSettings />
            </div>
        </div>
    );
};

export default ShopSettingsPage;
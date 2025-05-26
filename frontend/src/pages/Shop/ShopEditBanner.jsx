import React, { useState } from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import EditBanner from "../../components/Shop/EditBanner";

const ShopEditBanner = () => {
    const [openSidebar, setOpenSidebar] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
            <div className="flex justify-between w-full">
                <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px] fixed left-0 top-[80px] h-[calc(100vh-80px)] overflow-y-auto bg-white shadow-sm z-10`}>
                    <DashboardSideBar active={11} openSidebar={openSidebar} />
                </div>
                <div className={`${openSidebar ? 'ml-[250px]' : 'ml-[80px]'} 800px:ml-[330px] w-full min-h-[calc(100vh-80px)] p-4 transition-all duration-300`}>
                    <EditBanner />
                </div>
            </div>
        </div>
    )
}

export default ShopEditBanner 
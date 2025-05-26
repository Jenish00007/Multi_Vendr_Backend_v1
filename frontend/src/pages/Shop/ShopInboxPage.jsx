import React, { useState } from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => {
    const [openSidebar, setOpenSidebar] = useState(false);

    return (
        <div>
            <DashboardHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
            <div className="flex items-start justify-between w-full">
                <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
                    <DashboardSideBar active={8} openSidebar={openSidebar} />
                </div>
                <DashboardMessages />
            </div>
        </div>
    )
}

export default ShopInboxPage
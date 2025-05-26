import React, { useState } from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import CreateEvent from "../../components/Shop/CreateEvent";

const ShopCreateEvents = () => {
    const [openSidebar, setOpenSidebar] = useState(false);

    return (
        <div>
            <DashboardHeader setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
            <div className="flex justify-between w-full">
                <div className={`${openSidebar ? 'w-[250px]' : 'w-[80px]'} 800px:w-[330px]`}>
                    <DashboardSideBar active={5} openSidebar={openSidebar} />
                </div>
                <div className="w-full justify-center flex">
                    <CreateEvent />
                </div>
            </div>
        </div>
    )
}

export default ShopCreateEvents
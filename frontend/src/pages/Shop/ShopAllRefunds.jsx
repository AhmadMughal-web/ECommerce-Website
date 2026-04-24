import React from "react";
import DashboardHeader from "../../components/shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/shop/Layout/DashboardSideBar";
import AllRefundsOrders from "../../components/shop/AllRefundsOrders";

const ShopAllRefunds = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex justify-between w-full">
        <div className=" w-[80px]  800px:w-[280px] ">
          <DashboardSideBar active={10} />
        </div>
        <div className="w-full justify-center flex">
          <AllRefundsOrders />
        </div>
      </div>
    </div>
  );
};

export default ShopAllRefunds;

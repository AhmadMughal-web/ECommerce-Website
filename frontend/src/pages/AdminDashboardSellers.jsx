import React from "react";
import AdminHeader from "../components/layout/AdminHeader";
import AdminSideBar from "../components/Admin/layout/AdminSideBar";
import AllSellers from "../components/Admin/AllSellers";

const AdminDashboardSellers = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[280px]">
            <AdminSideBar active={3} />
          </div>
          <AllSellers />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSellers;

import React from "react";
import AdminHeader from "../components/layout/AdminHeader";
import AdminSideBar from "../components/Admin/layout/AdminSideBar";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain"

const AdminDashboardPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[280px]">
            <AdminSideBar active={1} />
          </div>
          <AdminDashboardMain />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

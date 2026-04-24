import React from "react";
import DashboardHeader from "../../components/shop/Layout/DashboardHeader";
import Footer from "../../components/layout/Footer";
import OrdersDetails from "../../components/shop/OrdersDetails";

const ShopOrdersDetails = () => {
  return (
    <div>
      <DashboardHeader />
      <OrdersDetails />
      <Footer />
    </div>
  );
};

export default ShopOrdersDetails;

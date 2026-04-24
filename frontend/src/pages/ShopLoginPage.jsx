import React, { useEffect } from "react";
import ShopLogin from "../components/shop/ShopLogin";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const ShopLoginPage = () => {
  const navigate = useNavigate();
  const { isSeller, seller,isLoading } = useSelector((state) => state.seller);

  useEffect(() => {
    if (isSeller && seller?._id) {
      navigate(`/dashboard`);
    }
  }, [isSeller, isLoading]);

  // Only hide form if seller exists and we will navigate
  if (isSeller && seller?._id) return null;

  return (
    <div>
      <ShopLogin />
    </div>
  );
};

export default ShopLoginPage;

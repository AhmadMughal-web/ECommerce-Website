import React, { useEffect, useState } from "react";
import styles from "../../styles/style";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../layout/loader";
import { Avatar } from "../../assests/asset";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop } from "../../redux/actions/product";

const ShopInfo = ({ isOwner }) => {
  const [data, setData] = useState({});
  const { products } = useSelector((state) => state.products);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProductsShop(id));
    setIsLoading(true);
    axios
      .get(`${server}/shop/get-shop-info/${id}`)
      .then((res) => {
        setData(res?.data?.shop || {});
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, [id, dispatch]);

  // ⭐ Ratings Calculation
  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const averageRating =
    totalReviewsLength > 0 ? (totalRatings / totalReviewsLength).toFixed(1) : 0;

  // ⭐ Total Price Calculation
  const totalProductsPrice =
    products &&
    products.reduce(
      (acc, product) =>
        acc + (product.discountPrice || product.originalPrice || 0),
      0
    );

  // Avatar URL Handling
  const avatarUrl = data?.avatar?.url;
  const fullAvatarUrl =
    avatarUrl && !avatarUrl.startsWith("http")
      ? `${backend_url}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`
      : avatarUrl || Avatar;

  // Logout
  const logoutHandler = () => {
    axios
      .get(`${server}/shop/logout`, { withCredentials: true })
      .then((resp) => {
        toast.success(resp?.data?.message || "Logged out");
        window.location.reload(true);
        navigate("/shop-login");
      })
      .catch((error) => {
        const message = error?.response?.data?.message || "Logout failed";
        toast.warning(message);
      });
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="w-full py-5">
            <div className="w-full flex items-center justify-center">
              <img
                src={fullAvatarUrl}
                alt="Shop avatar"
                className="w-[150px] h-[150px] object-cover rounded-full"
              />
            </div>
            <h3 className="text-center py-2 text-2xl">{data?.name || "-"}</h3>
            <p className="text-[16px] text-[#000000a6] p-3 flex items-center">
              {data?.description || "-"}
            </p>
          </div>

          <div className="p-3">
            <h5 className="font-[600]">Address</h5>
            <h4 className="text-[#000000b0]">{data?.address || "-"}</h4>
          </div>

          <div className="p-3">
            <h5 className="font-[600]">Phone Number</h5>
            <h4 className="text-[#000000b0]">{data?.phoneNumber || "-"}</h4>
          </div>

          <div className="p-3">
            <h5 className="font-[600]">Total Products</h5>
            <h4 className="text-[#000000b0]">{products && products.length}</h4>
          </div>

          <div className="p-3">
            <h5 className="font-[600]">Total Products Price</h5>
            <h4 className="text-[#000000b0]">${totalProductsPrice}</h4>
          </div>

          <div className="p-3">
            <h5 className="font-[600]">Shop Ratings</h5>
            <h4 className="text-[#000000b0]">{averageRating}/5</h4>
          </div>

          <div className="p-3">
            <h5 className="font-[600]">Joined On</h5>
            <h4 className="text-[#000000b0]">
              {data?.createdAt ? data.createdAt.slice(0, 10) : "-"}
            </h4>
          </div>

          {isOwner && (
            <div className="py-3 px-4 space-y-2">
              <Link to="/settings">
                <div
                  className={`${styles.button} !w-full !h-[44px] !rounded-[5px]`}
                >
                  <span className="text-white">Edit Shop</span>
                </div>
              </Link>
              <div
                className={`${styles.button} !w-full !h-[44px] !rounded-[5px]`}
                onClick={logoutHandler}
              >
                <span className="text-white">Log out</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShopInfo;

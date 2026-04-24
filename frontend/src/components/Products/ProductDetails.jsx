import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/style";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop } from "../../redux/actions/product";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { addToCart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import axios from "axios";

// FIXED: Helper handles both Cloudinary URLs (https) and local upload paths
const getImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string" && img.startsWith("http")) return img;
  if (typeof img === "object" && img?.url) {
    if (img.url.startsWith("http")) return img.url;
    return `${backend_url}/${img.url}`;
  }
  if (typeof img === "string") return `${backend_url}/${img}`;
  return "";
};

const ProductDetails = ({ data }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.products);

  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data?.shop?._id) dispatch(getAllProductsShop(data.shop._id));
    setClick(
      !!(data && Array.isArray(wishlist) && wishlist.find((i) => i._id === data._id))
    );
  }, [data, wishlist, dispatch]);

  const addToCartHandler = (id) => {
    if (Array.isArray(cart) && cart.find((i) => i?._id === id)) {
      toast.error("Item already in cart");
      return;
    }
    if (!data || Number(data.stock ?? 0) < 1) {
      toast.error("Product stock limited");
      return;
    }
    dispatch(addToCart({ ...data, qty: count }));
    toast.success("Item added to cart successfully!");
  };

  const handleMessageSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to send a message");
      navigate("/login");
      return;
    }
    await axios
      .post(
        `${server}/conversation/create-new-conversation`,
        { groupTitle: data._id + user._id, userId: user._id, sellerId: data.shop._id },
        { withCredentials: true }
      )
      .then(() => navigate("/inbox"))
      .catch((err) => toast.error(err?.response?.data?.message || "Failed"));
  };

  const images = Array.isArray(data?.images)
    ? data.images
    : data?.image_Url
    ? Array.isArray(data.image_Url) ? data.image_Url : [data.image_Url]
    : [];

  const totalReviewsLength =
    products?.reduce((acc, p) => acc + (p.reviews?.length || 0), 0) || 0;
  const totalRatings =
    products?.reduce(
      (acc, p) => acc + (p.reviews?.reduce((s, r) => s + (r.rating || 0), 0) || 0),
      0
    ) || 0;
  const averageRating =
    totalReviewsLength > 0 ? (totalRatings / totalReviewsLength).toFixed(1) : "0.0";

  const discountPrice = data?.discountPrice ?? data?.discount_price ?? null;
  const originalPrice = data?.price ?? data?.originalPrice ?? null;
  const shopAvatar = data?.shop?.avatar;

  return (
    <div className="bg-white">
      {data ? (
        <div className={`${styles.section} w-[90%] 800px:w-[80%]`}>
          <div className="w-full py-5">
            <div className="w-full 800px:flex">

              {/* LEFT — Images */}
              <div className="w-full 800px:w-[50%]">
                <img
                  src={getImageUrl(images[select] || images[0])}
                  alt={data.name || "product"}
                  className="w-[80%] object-cover rounded"
                  onError={(e) => { e.target.src = ""; }}
                />
                <div className="w-full flex flex-wrap mt-3 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded ${
                        select === index ? "border-[#3321c8]" : "border-transparent"
                      }`}
                      onClick={() => setSelect(index)}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${data.name}-${index}`}
                        className="h-[80px] w-[80px] object-cover rounded"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="w-full 800px:w-[50%] pt-5">
                <h1 className={`${styles.productTitle}`}>{data.name}</h1>
                <p className="text-gray-600 mt-2">{data.description}</p>

                <div className="flex items-center gap-4 pt-3">
                  {discountPrice && (
                    <h4 className={`${styles.productDiscountPrice}`}>${discountPrice}</h4>
                  )}
                  {originalPrice && (
                    <h3 className={`${styles.price}`}>${originalPrice}</h3>
                  )}
                </div>

                <div className={`${styles.normalFlex} mt-6 justify-between pr-3`}>
                  <div className="flex items-center gap-3">
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2"
                      onClick={() => setCount((c) => (c > 1 ? c - 1 : c))}
                    >-</button>
                    <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">
                      {count}
                    </span>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-r px-4 py-2"
                      onClick={() => setCount((c) => c + 1)}
                    >+</button>

                    {click ? (
                      <AiFillHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => { setClick(false); dispatch(removeFromWishlist(data)); }}
                        color="red"
                      />
                    ) : (
                      <AiOutlineHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => { setClick(true); dispatch(addToWishlist(data)); }}
                        color="#333"
                      />
                    )}
                  </div>

                  <div
                    className={`${styles.button} !mt-0 !rounded !h-11 flex items-center cursor-pointer`}
                    onClick={() => addToCartHandler(data._id)}
                  >
                    <span className="text-white flex items-center gap-2">
                      Add to cart <AiOutlineShoppingCart />
                    </span>
                  </div>
                </div>

                <div className="flex items-center pt-8 gap-4 flex-wrap">
                  <Link to={`/shop/preview/${data?.shop?._id}`}>
                    <img
                      src={getImageUrl(shopAvatar)}
                      alt="shop"
                      className="w-[50px] h-[50px] rounded-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </Link>
                  <div>
                    <h3 className={`${styles.shop_name} pt-1`}>
                      {data?.shop?.name || "Shop"}
                    </h3>
                    <h5 className="pb-3 text-[15px]">({averageRating}/5) Ratings</h5>
                  </div>
                  <div
                    className={`${styles.button} bg-[#6443d1] !rounded !h-11 cursor-pointer`}
                    onClick={handleMessageSubmit}
                  >
                    <span className="text-white flex items-center">
                      Send Message <AiOutlineMessage className="ml-1 mt-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProductDetailsInfo
            data={data}
            products={products}
            totalReviewsLength={totalReviewsLength}
            averageRating={averageRating}
          />
          <br /><br />
        </div>
      ) : (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <p className="text-gray-400 text-lg">Product not found.</p>
        </div>
      )}
    </div>
  );
};

const ProductDetailsInfo = ({ data, products, totalReviewsLength, averageRating }) => {
  const [active, setActive] = useState(1);
  const shopAvatar = data?.shop?.avatar;

  return (
    <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded">
      <div className="w-full flex justify-between border-b pt-10 pb-2">
        {["Product Detail", "Product Reviews", "Seller Information"].map((tab, i) => (
          <div className="relative" key={i}>
            <h5
              className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-xl"
              onClick={() => setActive(i + 1)}
            >
              {tab}
            </h5>
            {active === i + 1 && <div className={`${styles.active_indicator}`} />}
          </div>
        ))}
      </div>

      {active === 1 && (
        <p className="py-4 text-[18px] leading-8 whitespace-pre-line">
          {data?.description || "No description available."}
        </p>
      )}

      {active === 2 && (
        <div className="w-full min-h-[40vh] flex flex-col items-center py-3">
          {data?.reviews?.length > 0 ? (
            // FIXED: was missing "return" in map — nothing rendered
            data.reviews.map((item, index) => (
              <div key={index} className="w-full flex my-2">
                <img
                  src={getImageUrl(item?.user?.avatar)}
                  alt=""
                  className="w-[50px] h-[50px] rounded-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="pl-2">
                  <div className="w-full flex items-center">
                    <h1 className="font-[500] mr-3">{item?.user?.name}</h1>
                    <Ratings rating={item?.rating} />
                  </div>
                  <p className="text-gray-600">{item?.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <h5 className="text-gray-500 mt-10">No reviews yet for this product.</h5>
          )}
        </div>
      )}

      {active === 3 && (
        <div className="w-full sm:flex justify-between p-5">
          <div className="w-full 800px:w-[50%]">
            <Link to={`/shop/preview/${data?.shop?._id}`}>
              <div className="flex items-center">
                <img
                  src={getImageUrl(shopAvatar)}
                  className="w-[50px] h-[50px] rounded-full object-cover"
                  alt="shop"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="pl-3">
                  <h3 className={`${styles.shop_name}`}>{data?.shop?.name}</h3>
                  {/* FIXED: was showing literal string "(averageRating)/5" — now uses variable */}
                  <h4 className="pb-3 text-[15px]">({averageRating}/5) Ratings</h4>
                </div>
              </div>
            </Link>
            <p className="pt-2 text-gray-600">{data?.shop?.description || ""}</p>
          </div>

          <div className="w-full 800px:w-[50%] mt-5 800px:mt-0 flex flex-col items-center">
            <div className="text-left">
              <h5 className="font-[700]">
                Joined on:{" "}
                <span className="font-[500]">
                  {data?.shop?.createdAt
                    ? String(data.shop.createdAt).slice(0, 10)
                    : ""}
                </span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Products:{" "}
                <span className="font-[500]">{products?.length ?? 0}</span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Reviews:{" "}
                <span className="font-[500]">{totalReviewsLength}</span>
              </h5>
              <Link to={`/shop/preview/${data?.shop?._id}`}>
                <div className={`${styles.button} rounded !h-[40px] mt-3`}>
                  <h4 className="text-white font-semibold text-[18px]">Visit Shop</h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

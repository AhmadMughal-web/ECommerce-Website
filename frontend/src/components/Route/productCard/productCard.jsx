import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/style";
import ProductDetailCard from "../ProductDetailCard/ProductDetailCard";
import {
  AiFillHeart,
  AiFillStar,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineStar,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { addToCart } from "../../../redux/actions/cart.js";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings.jsx";

const ProductCard = ({ data, isEvents }) => {
  const cart = useSelector((state) => state.cart?.cart ?? []);
  const wishlist = useSelector((state) => state.wishlist?.wishlist ?? []);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const productId = data?._id;
  const productPath = `/product/${productId ?? ""}`;

  useEffect(() => {
    if (!productId || !Array.isArray(wishlist)) {
      setClick(false);
      return;
    }
    const exists = wishlist.find((i) => i?._id === productId);
    setClick(Boolean(exists));
  }, [wishlist, productId]);

  const removeFromWishlistHandler = (item) => {
    setClick(false);
    dispatch(removeFromWishlist(item));
  };

  const addFromWishlistHandler = (item) => {
    setClick(true);
    dispatch(addToWishlist(item));
  };

  const addToCartHandler = (id) => {
    const isItemExists = Array.isArray(cart) && cart.find((i) => i?._id === id);
    if (isItemExists) {
      toast.error("Item already in cart");
      return;
    }
    if (!data) return;

    if ((data.stock ?? 0) < 1) {
      toast.error("Product stock limited");
    } else {
      const cartData = { ...data, qty: 1 };
      dispatch(addToCart(cartData));
      toast.success("Item added to cart successfully!");
    }
  };

  // defensive image/shop access
  const imgUrl = data?.images[0];
  const shopName = data?.shop?.name || "";
  const discountPrice = data?.discount_price;
  const price = data?.price;

  return (
    <>
      <div className="w-full h-[370px] bg-white rounded-lg shadow-sm p-3 relative cursor-pointer">
        <div className="flex justify-end"></div>
        <Link
          to={
            isEvents === true
              ? `/product/${data._id}?isEvents`
              : `/product/${data._id}`
          }
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={data?.name || "Product"}
              className="w-full h-[170px] object-contain"
            />
          ) : (
            <div className="w-full h-[170px] bg-gray-100 rounded-md" />
          )}
        </Link>

        <Link to={`/shop/preview/${data?.shop?._id}`}>
          <h5 className={`${styles.shop_name}`}>{shopName}</h5>
        </Link>
        <Link
          to={
            isEvents === true
              ? `/product/${data._id}?isEvents`
              : `/product/${data._id}`
          }
        >
          <h4 className="pb-3 font-[500]">
            {data?.name
              ? data.name.length > 40
                ? data.name.slice(0, 40) + "..."
                : data.name
              : "Unnamed Product"}
          </h4>

          <div className="flex">
            <Ratings rating={data?.rating} />
          </div>

          <div className="py-2 flex items-center justify-between">
            <div className="flex">
              <h5 className={`${styles.productDiscountPrice}`}>
                {discountPrice != null
                  ? `${discountPrice}$`
                  : price === 0
                  ? "0$"
                  : null}
              </h5>
              <h4 className={`${styles.price}`}>
                {price ? `${price}$` : null}
              </h4>
            </div>

            <span className="font-[400] text-[17px] text-[#68d284]">
              {data?.sold_out} sold
            </span>
          </div>
        </Link>

        {/* SIDE OPTIONS */}
        <div>
          {click ? (
            <AiFillHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => removeFromWishlistHandler(data)}
              color="red"
              title="Remove from wishlist"
            />
          ) : (
            <AiOutlineHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => addFromWishlistHandler(data)}
              color="#333"
              title="Add to wishlist"
            />
          )}

          <AiOutlineEye
            size={22}
            className="cursor-pointer absolute right-2 top-14"
            onClick={() => setOpen(!open)}
            color="#333"
            title="Quick view"
          />

          <AiOutlineShoppingCart
            size={25}
            className="cursor-pointer absolute right-2 top-24"
            onClick={() => addToCartHandler(productId)}
            color="#444"
            title="Add to cart"
          />

          {open ? <ProductDetailCard setOpen={setOpen} data={data} /> : null}
        </div>
      </div>
    </>
  );
};

export default ProductCard;

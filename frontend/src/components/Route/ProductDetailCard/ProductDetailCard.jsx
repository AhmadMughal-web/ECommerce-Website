import React, { useEffect, useState, useMemo } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../../styles/style";
import {
  AiOutlineMessage,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCart } from "../../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";

const ProductDetailCard = ({ setOpen, data }) => {
  // ✅ Safe selectors (won't crash if slice is missing during init)
  const cart = useSelector((state) => state.cart?.cart ?? []);
  const wishlist = useSelector((state) => state.wishlist?.wishlist ?? []);

  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);

  const productId = data?._id;

  const decrement = () => {
    if (count > 1) setCount((c) => c - 1);
  };
  const increment = () => setCount((c) => c + 1);

  const addToCartHandler = (id) => {
    const isItemExists = Array.isArray(cart) && cart.find((i) => i?._id === id);
    if (isItemExists) {
      toast.error("Item already in cart");
      return;
    }
    if (!data) return;

    if ((data.stock ?? 0) < count) {
      toast.error("Product stock limited");
    } else {
      const cartData = { ...data, qty: count };
      dispatch(addToCart(cartData));
      toast.success("Item added to cart successfully!");
    }
  };

  useEffect(() => {
    if (!productId || !Array.isArray(wishlist)) {
      setClick(false);
      return;
    }
    // ✅ fixed .find typo + safe check
    const exists = wishlist.find((i) => i?._id === productId);
    setClick(Boolean(exists));
  }, [wishlist, productId]); // ✅ include productId for ESLint

  const removeFromWishlistHandler = (item) => {
    setClick(false);
    dispatch(removeFromWishlist(item));
  };

  const addFromWishlistHandler = (item) => {
    setClick(true);
    dispatch(addToWishlist(item));
  };

  const handleMessageSubmit = () => {};

  // ✅ Defensive values to avoid undefined errors
  const mainImage = data?.image_Url?.[0]?.url || "";
  const shopAvatar = data?.shop?.shop_avatar?.url || "";
  const shopName = data?.shop?.name || "";
  const shopRatings = data?.shop?.ratings ?? 0;
  const discountPrice = data?.discount_price;
  const price = data?.price;

  // (Optional) memoize sold text
  const soldText = useMemo(
    () => `(${data?.total_sell ?? 0}) sold Out`,
    [data?.total_sell]
  );

  return (
    <div className="bg-white">
      {data ? (
        <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
          {/* ✅ roudned-md -> rounded-md */}
          <div className="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
            <RxCross1
              size={30}
              className="absolute right-3 top-3 z-50 cursor-pointer"
              onClick={() => setOpen(false)}
            />

            <div className="block w-[100%] 800px:flex">
              {/* Left */}
              <div className="w-full 800px:w-[50%]">
                {mainImage ? (
                  <img src={mainImage} alt={data.name || "product"} />
                ) : (
                  <div className="w-full h-[300px] bg-gray-100 rounded-md" />
                )}

                <div className="flex mt-3 items-center">
                  {shopAvatar ? (
                    <img
                      src={shopAvatar}
                      alt=""
                      className="w-[50px] h-[50px] rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-[50px] h-[50px] rounded-full mr-2 bg-gray-200" />
                  )}
                  <div>
                    <h3 className={styles.shop_name}>{shopName}</h3>
                    <h5 className="pb-3 text-[15px]">({shopRatings}) Ratings</h5>
                  </div>
                </div>

                {/* Send Message */}
                <div
                  className={`${styles.button} bg-black mt-4 rounded-[4px] h-11`}
                  onClick={handleMessageSubmit}
                >
                  <span className="text-[#fff] flex items-center">
                    Send Message <AiOutlineMessage className="ml-1" />
                  </span>
                </div>

                <h5 className="text-[16px] text-[red] mt-5">{soldText}</h5>
              </div>

              {/* Right */}
              <div className="w-full 800px:w-[50%] pt-5 px-[5px]">
                <h1 className={`${styles.productTitle} text-[20px]`}>
                  {data.name}
                </h1>
                <p>{data.description}</p>

                <div className="flex pt-3 items-baseline space-x-3">
                  {discountPrice != null && (
                    <h4 className={styles.productDiscountPrice}>
                      {discountPrice}$
                    </h4>
                  )}
                  <h3 className={styles.price}>{price ? `${price}$` : null}</h3>
                </div>

                <div className="flex items-center mt-12 justify-between pr-3">
                  {/* Quantity */}
                  <div>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={decrement}
                    >
                      -
                    </button>
                    <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">
                      {count}
                    </span>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-r px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={increment}
                    >
                      +
                    </button>
                  </div>

                  {/* Wishlist */}
                  <div>
                    {click ? (
                      <AiFillHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => removeFromWishlistHandler(data)}
                        color="red"
                        title="Remove from wishlist"
                      />
                    ) : (
                      <AiOutlineHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => addFromWishlistHandler(data)}
                        title="Add to wishlist"
                      />
                    )}
                  </div>
                </div>

                {/* Add to cart */}
                <div
                  className={`${styles.button} mt-6 h-11 flex items-center`}
                  onClick={() => addToCartHandler(productId)}
                >
                  <span className="text-[#fff] flex items-center">
                    Add to cart <AiOutlineShoppingCart className="ml-1 mt-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetailCard;

import React from "react";
import styles from "../../styles/style";
import CountDown from "../CountDown";
import { backend_url } from "../../server";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/actions/cart";
import { toast } from "react-toastify";

const EventCard = ({ active, data }) => {
  const cart = useSelector((state) => state.cart?.cart ?? []);
  const dispatch = useDispatch();
  if (!data) return null;

  const imgSrc = data?.images?.[0]

  const originalPrice =
    data?.originalPrice !== undefined ? `${data.originalPrice}$` : "-";
  const discountPrice =
    data?.discountPrice !== undefined ? `${data.discountPrice}$` : "-";

  const containerExtraClass = active ? "" : "mb-4";

  const addToCartHandler = (data) => {
    const isItemExists =
      Array.isArray(cart) && cart.find((i) => i?._id === data._id);

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

  return (
    <div
      className={`w-full block bg-white rounded-lg ${containerExtraClass} lg:flex p-2`}
    >
      <div className="w-full lg:w-[50%] m-auto">
        <img src={imgSrc} alt={data?.name || "event image"} />
      </div>

      <div className="w-full lg:w-[50%] flex flex-col justify-center">
        <h2 className={`${styles.productTitle}`}>{data?.name}</h2>
        <p>{data?.description}</p>

        <div className="flex py-2 justify-between">
          <div className="flex">
            <h5 className="font-[500] text-[18px] text-[#d55b45] pr-3 line-through">
              {originalPrice}
            </h5>
            <h5 className="font-bold text-[20px] text-[#333] font-Roboto">
              {discountPrice}
            </h5>
          </div>

          <span className="pr-3 font-[400] text-[17px] text-[#44a55e]">
            {data?.sold ?? "0"} sold
          </span>
        </div>

        <CountDown data={data} />
        <br />
        <div className="flex items-center">
          <Link to={`/product/${data._id}?isEvent=true`}>
            <div className={`${styles.button} text-white`}>See Details</div>
          </Link>
          <div
            className={`${styles.button} text-white ml-5`}
            onClick={() => addToCartHandler(data)}
          >
            Add to Cart
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

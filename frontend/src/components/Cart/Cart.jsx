import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/style";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import { Avatar } from "../../assests/asset";

const Cart = ({ setOpenCard }) => {
  const cart = useSelector((state) => state.cart?.cart ?? []);
  const dispatch = useDispatch();

  const removeFromCartHandler = (item) => {
    dispatch(removeFromCart(item));
  };

  const totalPrice = (cart || []).reduce((acc, item) => {
    const price = parseFloat(item?.discountPrice ?? item?.price ?? 0) || 0;
    const qty = parseInt(item?.qty ?? 1, 10) || 1;
    return acc + price * qty;
  }, 0);

  const quantityChangeHandler = (updatedItem) => {
    dispatch(addToCart(updatedItem));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
      <div className="fixed top-0 right-0 h-full w-[80%] 800px:w-[25%] bg-white flex flex-col overflow-y-scroll justify-between shadow-sm">
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setOpenCard(false)}
              />
            </div>
            <h5>Cart is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setOpenCard(false)}
                />
              </div>
              {/* FIXED: was styles.noramlFlex (typo) — correct is styles.normalFlex */}
              <div className={`${styles.normalFlex} p-4`}>
                <IoBagHandleOutline size={25} />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {cart && cart.length} items
                </h5>
              </div>
              <br />
              <div className="w-full border-t">
                {cart &&
                  cart.map((i, index) => (
                    <CartSingle
                      key={index}
                      data={i}
                      quantityChangeHandler={quantityChangeHandler}
                      removeFromCartHandler={removeFromCartHandler}
                    />
                  ))}
              </div>
            </div>

            <div className="px-5 mb-3">
              <Link to="/checkout">
                <div className="h-[45px] flex items-center justify-center w-full bg-[#e44343] rounded-[5px]">
                  <h1 className="text-white text-[18px] font-[600]">
                    Checkout Now (USD${totalPrice.toFixed(2)})
                  </h1>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);
  const totalPrice = (data.discountPrice ?? data.price ?? 0) * value;

  const increment = (data) => {
    if (data.stock < value) {
      toast.error("Product stock limited!");
    } else {
      setValue(value + 1);
      quantityChangeHandler({ ...data, qty: value + 1 });
    }
  };

  const decrement = (data) => {
    const newVal = value === 1 ? 1 : value - 1;
    setValue(newVal);
    quantityChangeHandler({ ...data, qty: newVal });
  };

  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center">
        <div>
          <div
            className="bg-[#e44343] border border-[#e4434373] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer"
            onClick={() => increment(data)}
          >
            <HiPlus size={18} color="#fff" />
          </div>
          <span className="pl-[10px]">{data.qty}</span>
          <div
            className="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer"
            onClick={() => decrement(data)}
          >
            <HiOutlineMinus size={16} color="#7d879c" />
          </div>
        </div>
        <img
          src={
            data?.images?.[0]?.url ||
            data?.images?.[0] ||
            data?.image_Url?.[0]?.url ||
            Avatar
          }
          alt={data?.name || "Product"}
          className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
          onError={(e) => (e.target.src = Avatar)}
        />
        <div className="pl-[5px]">
          <h1>{data.name}</h1>
          <h4 className="font-[400] text-[15px] text-[#00000082]">
            ${data.discountPrice ?? data.price ?? 0} * {value}
          </h4>
          <h4 className="font-[600] text-[17px] pt-[3px] text-[#d02222] font-Roboto">
            US${totalPrice.toFixed(2)}
          </h4>
        </div>
        <RxCross1
          className="cursor-pointer ml-auto"
          onClick={() => removeFromCartHandler(data)}
        />
      </div>
    </div>
  );
};

export default Cart;

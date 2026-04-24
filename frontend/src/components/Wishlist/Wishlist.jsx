import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/style";
import { BsCartPlus } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { addToCart } from "../../redux/actions/cart";

const Wish = ({ setOpenWish }) => {
  const wishlist = useSelector((state) => state.wishlist?.wishlist ?? []);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addToCart(newData));
    setOpenWish(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full text-black bg-[#0000002c] h-screen z-10">
      <div className="fixed top-0 right-0 h-full w-[80%] overflow-y-scroll 800px:w-[25%] bg-white flex flex-col justify-between shadow-sm">
        {Array.isArray(wishlist) && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                className="cursor-pointer"
                onClick={() => setOpenWish(false)}
              />
            </div>
            <h5>Wishlist is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end top-0 right-2 fixed mt-4 pr-5 text-black ">
                <RxCross1
                  className="cursor-pointer "
                  onClick={() => setOpenWish(false)}
                />
              </div>

              <div className={`${styles.normalFlex} px-4 mt-12`}>
                <AiOutlineHeart size={25} />
                <h5 className="pl-2 text-5 font-[500]">
                  {Array.isArray(wishlist) ? wishlist.length : 0} Items
                </h5>
              </div>

              <br />
              <div className="w-full border-t">
                {Array.isArray(wishlist) &&
                  wishlist.map((i) => (
                    <CartSingle
                      key={i._id ?? i.name ?? Math.random()}
                      data={i}
                      removeFromWishlistHandler={removeFromWishlistHandler}
                      addToCartHandler={addToCartHandler}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, removeFromWishlistHandler, addToCartHandler }) => {
  const [value] = useState(1);
  const totalPrice = (data?.discount_price ?? 0) * value;

  return (
    <div className="border-b p-2">
      <div className="w-full 800px:flex items-center gap-4">
        <RxCross1
          className="cursor-pointer 800px:mb-['unset'] 800px:ml-['unset'] mb-2 ml-2"
          onClick={() => removeFromWishlistHandler(data)}
        />
        <img
          src={data?.image_Url?.[0]?.url || "https://via.placeholder.com/150"}
          alt={data?.name}
          className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
        />

        <div className="pl-1 flex-1">
          <h1 className="font-semibold">{data?.name}</h1>
          <h4 className="font-[600] pt-3 800px:pt-[3px] text-[17px] text-[#db2222] font-Roboto">
            US${totalPrice}
          </h4>
        </div>

        <div>
          <BsCartPlus
            size={20}
            className="cursor-pointer"
            title="Add to cart"
            onClick={() => addToCartHandler(data)}
          />
        </div>
      </div>
    </div>
  );
};

export default Wish;

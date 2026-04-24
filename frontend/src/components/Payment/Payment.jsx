import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/style";
import { useEffect } from "react";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";

const Payment = () => {
  const [orderData, setOrderData] = useState(null);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(data);
  }, []);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: "E-Shop Order",
          amount: {
            currency_code: "USD",
            value: orderData?.totalPrice,
          },
        },
      ],
      application_context: { shipping_preference: "NO_SHIPPING" },
    });
  };

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      if (payer !== undefined) {
        paypalPaymentHandler(payer);
      }
    });
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    const config = { headers: { "Content-Type": "application/json" } };
    order.paymentInfo = {
      id: paymentInfo.payer_id,
      status: "succeeded",
      type: "Paypal",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then(() => {
        setOpen(false);
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        navigate("/order/success"); // FIXED: removed window.location.reload() after navigate
        toast.success("Order successful!");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Payment failed");
      });
  };

  const paymentData = { amount: Math.round((orderData?.totalPrice || 0) * 100) };

  const paymentHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post(
        `${server}/payment/process`,
        paymentData,
        config
      );
      const client_secret = data.client_secret;
      if (!stripe || !elements) return;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user?.name || "Guest",
            email: user?.email || "",
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        order.paymentInfo = {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
          type: "Credit Card",
        };
        await axios
          .post(`${server}/order/create-order`, order, config)
          .then(() => {
            setOpen(false);
            localStorage.setItem("cartItems", JSON.stringify([]));
            localStorage.setItem("latestOrder", JSON.stringify([]));
            navigate("/order/success"); // FIXED: removed window.location.reload()
            toast.success("Order successful!");
          });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();
    const rawOrder = JSON.parse(localStorage.getItem("latestOrder"));
    if (!rawOrder) return toast.error("Order data missing!");

    const formattedCart = rawOrder.cart.map((item) => ({
      productId: item._id,
      shopId: item.shopId,
      name: item.name,
      qty: item.qty,
      price: item.discountPrice ?? item.price,
      image: item.images?.[0] || item.image,
    }));

    const formattedShipping = {
      ...rawOrder.shippingAddress,
      phoneNumber: rawOrder.user?.phoneNumber,
    };

    const formattedOrder = {
      cart: formattedCart,
      shippingAddress: formattedShipping,
      user: rawOrder.user?._id,
      totalPrice: rawOrder.totalPrice,
      paymentInfo: { type: "Cash On Delivery" },
    };

    // FIXED: removed duplicate console.log(formattedOrder)
    const config = { headers: { "Content-Type": "application/json" } };
    await axios
      .post(`${server}/order/create-order`, formattedOrder, config)
      .then(() => {
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        navigate("/order/success"); // FIXED: removed window.location.reload()
        toast.success("Order successful!");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Order failed!");
      });
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <PaymentInfo
            user={user}
            open={open}
            setOpen={setOpen}
            onApprove={onApprove}
            createOrder={createOrder}
            paymentHandler={paymentHandler}
            cashOnDeliveryHandler={cashOnDeliveryHandler}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

const PaymentInfo = ({
  user,
  open,
  setOpen,
  onApprove,
  createOrder,
  paymentHandler,
  cashOnDeliveryHandler,
}) => {
  const [select, setSelect] = useState(1);

  // NOTE: Move PAYPAL_CLIENT_ID to .env as REACT_APP_PAYPAL_CLIENT_ID
  const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";

  return (
    <div className="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
      {/* CARD PAYMENT */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
            onClick={() => setSelect(1)}
          >
            {select === 1 && <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with Debit/credit card
          </h4>
        </div>

        {select === 1 && (
          <div className="w-full flex border-b pb-4">
            <form className="w-full" onSubmit={paymentHandler}>
              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Name On Card</label>
                  <input
                    required
                    placeholder={user?.name}
                    className={`${styles.input} !w-[95%] text-[#444]`}
                    value={user?.name || ""}
                    readOnly
                  />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">Exp Date</label>
                  <CardExpiryElement className={`${styles.input}`} />
                </div>
              </div>
              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Card Number</label>
                  <CardNumberElement className={`${styles.input} !h-[35px] !w-[95%]`} />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">CVV</label>
                  <CardCvcElement className={`${styles.input} !h-[35px]`} />
                </div>
              </div>
              <input
                type="submit"
                value="Pay Now"
                className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              />
            </form>
          </div>
        )}
      </div>

      <br />

      {/* PAYPAL */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
            onClick={() => setSelect(2)}
          >
            {select === 2 && <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">Pay with Paypal</h4>
        </div>

        {select === 2 && (
          <div className="w-full flex border-b pb-4">
            <div
              className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              onClick={() => setOpen(true)}
            >
              Pay Now
            </div>
            {open && (
              <div className="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
                <div className="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
                  <div className="w-full flex justify-end p-3">
                    <RxCross1
                      size={30}
                      className="cursor-pointer absolute top-3 right-3"
                      onClick={() => setOpen(false)}
                    />
                  </div>
                  {PAYPAL_CLIENT_ID ? (
                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
                      <PayPalButtons
                        style={{ layout: "vertical" }}
                        onApprove={onApprove}
                        createOrder={createOrder}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <p className="text-center text-red-500">
                      PayPal client ID not configured. Add REACT_APP_PAYPAL_CLIENT_ID to .env
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <br />

      {/* CASH ON DELIVERY */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
            onClick={() => setSelect(3)}
          >
            {select === 3 && <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">Cash on Delivery</h4>
        </div>

        {select === 3 && (
          <div className="w-full flex">
            <form className="w-full" onSubmit={cashOnDeliveryHandler}>
              <input
                type="submit"
                value="Confirm Order"
                className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping ? orderData.shipping.toFixed(2) : "0.00";
  // FIXED: removed console.log(orderData)

  return (
    <div className="w-full bg-white rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">${orderData?.subTotalPrice?.toFixed(2)}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">${shipping}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice ? "-$" + orderData.discountPrice : "-"}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">
        Total: ${orderData?.totalPrice?.toFixed(2)}
      </h5>
    </div>
  );
};

export default Payment;

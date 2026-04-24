import React, { useState, useEffect } from "react";
import styles from "../../styles/style";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Checkout = () => {
  const { user } = useSelector((state) => state?.user);
  const { cart } = useSelector((state) => state?.cart);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subTotalPrice = (cart || []).reduce(
    (acc, item) => acc + item.qty * (item.discountPrice ?? item.price ?? 0),
    0
  );

  const shipping = subTotalPrice * 0.1;
  const discountAmount = couponCodeData ? discountPrice : 0;
  const totalPrice = subTotalPrice + shipping - discountAmount;

  const paymentSubmit = () => {
    // FIXED: address2 is optional — removed from required check
    if (!address1 || !zipCode || !country || !city) {
      toast.error("Please fill all required delivery fields!");
      return;
    }

    const shippingAddress = {
      address1,
      address2, // optional field — included if provided
      zipCode,
      country,
      city,
      phoneNumber: user?.phoneNumber,
    };

    const orderData = {
      cart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice: discountAmount,
      shippingAddress,
      user,
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/payment");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode) return;

    await axios
      .get(`${server}/coupon/get-coupon-value/${couponCode}`)
      .then((res) => {
        const shopId = res.data.couponCode?.shopId;
        const couponValue = res.data.couponCode?.value;

        if (!res.data.couponCode) {
          toast.error("Coupon code is not valid!");
          setCouponCode("");
          return;
        }

        const isCouponValid = cart && cart.filter((item) => item.shopId === shopId);

        if (!isCouponValid || isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop");
          setCouponCode("");
          return;
        }

        const eligiblePrice = isCouponValid.reduce(
          (acc, item) => acc + item.qty * (item.discountPrice ?? item.price ?? 0),
          0
        );
        const discount = (eligiblePrice * couponValue) / 100;
        setDiscountPrice(discount);
        setCouponCodeData(res.data.couponCode);
        toast.success(`Coupon applied! You saved $${discount.toFixed(2)}`);
        setCouponCode("");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Invalid coupon code");
        setCouponCode("");
      });
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <ShippingInfo
            user={user}
            country={country}
            setCountry={setCountry}
            city={city}
            setCity={setCity}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            address1={address1}
            setAddress1={setAddress1}
            address2={address2}
            setAddress2={setAddress2}
            zipCode={zipCode}
            setZipCode={setZipCode}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData
            handleSubmit={handleSubmit}
            totalPrice={totalPrice}
            shipping={shipping}
            subTotalPrice={subTotalPrice}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            discountPrice={discountAmount}
          />
        </div>
      </div>
      <div
        className={`${styles.button} w-[150px] 800px:w-[280px] mt-10 text-white`}
        onClick={paymentSubmit}
      >
        Go to Payment
      </div>
    </div>
  );
};

const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
}) => {
  return (
    <div className="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
      <h5 className="text-[18px] font-[500]">Shipping Address</h5>
      <br />
      <form>
        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Full Name</label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Phone Number</label>
            <input
              type="number"
              value={user?.phoneNumber || ""}
              readOnly
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Zip Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Country <span className="text-red-500">*</span></label>
            <select
              className="w-full border h-[35px] rounded-[5px]"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Choose your country</option>
              {Country.getAllCountries().map((item) => (
                <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">City <span className="text-red-500">*</span></label>
            <select
              className="w-full border h-[35px] rounded-[5px]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Choose your city</option>
              {State.getStatesOfCountry(country).map((item) => (
                <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Address 1 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            {/* FIXED: address2 is optional — removed from required validation */}
            <label className="block pb-2">
              Address 2 <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className={`${styles.input}`}
            />
          </div>
        </div>

        {/* Saved addresses */}
        {user?.addresses?.length > 0 && (
          <div>
            <h5
              className="text-[18px] cursor-pointer inline-block text-[#0000EE]"
              onClick={() => setUserInfo(!userInfo)}
            >
              Choose from saved addresses
            </h5>
            {userInfo && (
              <div>
                {user.addresses.map((item, index) => (
                  <div
                    key={index}
                    className="w-full flex mt-1 cursor-pointer"
                    onClick={() => {
                      setAddress1(item.address1);
                      setAddress2(item.address2 || "");
                      setZipCode(item.zipCode);
                      setCountry(item.country);
                      setCity(item.city);
                      setUserInfo(false);
                    }}
                  >
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={address1 === item.address1}
                      readOnly
                    />
                    <h2>{item.addressType}</h2>
                    <h5 className="pl-2">{item.address1}</h5>
                    <h5 className="pl-2">{Country.getCountryByCode(item.country)?.name}</h5>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPrice,
}) => {
  return (
    <div className="w-full bg-white rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">${subTotalPrice.toFixed(2)}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">${shipping.toFixed(2)}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {discountPrice ? "-$" + discountPrice.toFixed(2) : "-"}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">
        Total: ${totalPrice.toFixed(2)}
      </h5>
      <br />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter coupon code..."
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className={`${styles.input}`}
        />
        <input
          type="submit"
          value="Apply"
          className={`w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-4 cursor-pointer`}
        />
      </form>
    </div>
  );
};

export default Checkout;

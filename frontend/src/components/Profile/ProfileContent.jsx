import React, { useState } from "react";
import {
  AiOutlineArrowRight,
  AiOutlineCamera,
  AiOutlineDelete,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/style";
import { Avatar } from "../../assests/asset";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { MdTrackChanges } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { backend_url, server } from "../../server";
import {
  deleteUserAddress,
  loadUser,
  updateUserAddress,
  updateUserInformation,
} from "../../redux/actions/user";
import { City, Country, State } from "country-state-city";
import { useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getAllOrdersOfUser } from "../../redux/actions/order";

const ProfileContent = ({ active }) => {
  // FIXED: was reading from state.order — user is in state.user
  const { user, error, successMessage } = useSelector((state) => state.user);
  const avatarUrl = user?.avatar?.url;
  const fullAvatarUrl =
    avatarUrl && !avatarUrl.startsWith("http")
      ? `${backend_url}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`
      : avatarUrl || Avatar;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearError" }); // FIXED: was "clearErrors" (with 's') — doesn't exist in reducer
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch({ type: "clearMessage" });
    }
  }, [error, successMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserInformation(name, email, phoneNumber, password));
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", file);

    await axios
      .put(`${server}/user/update-avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      .then(() => {
        dispatch(loadUser());
        toast.success("Avatar updated successfully!");
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || error.message);
      });
  };

  return (
    <div className="w-full ">
      {/* PROFILE UPDATE */}
      {active === 1 && (
        <>
          <div className=" flex justify-center w-full ">
            <div className="relative">
              <img
                src={fullAvatarUrl}
                onError={(e) => { e.target.src = Avatar; }}
                className="w-36 h-36 border-[#3ad132] rounded-full border-3"
                alt="User Avatar"
              />
              <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-1 right-1">
                <input
                  type="file"
                  id="image"
                  name="image"
                  className="hidden"
                  onChange={handleImage}
                />
                <label htmlFor="image">
                  <AiOutlineCamera />
                </label>
              </div>
            </div>
          </div>
          <br />
          <br />
          <div className="w-full px-5">
            <form onSubmit={handleSubmit}>
              <div className="w-full 800px:flex pb-3">
                <div className=" w-full 800px:w-[50%]">
                  <label className="block pb-2">Full Name</label>
                  <input
                    type="text"
                    className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className=" w-full 800px:w-[50%]">
                  <label className="block pb-2">Email Address</label>
                  <input
                    type="email"
                    className={`${styles.input} !w-[95%] 800px:mb-0`}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full 800px:flex pb-3">
                <div className=" w-full 800px:w-[50%]">
                  <label className="block pb-2">Phone Number</label>
                  <input
                    type="number"
                    className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className=" w-full 800px:w-[50%]">
                  <label className="block pb-2">Password</label>
                  <input
                    type="password"
                    className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`w-[250px] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer`}
              >
                Update
              </button>
            </form>
          </div>
        </>
      )}
      {/* ORDER SECTION */}
      {active === 2 && (
        <div>
          <AllOrders />
        </div>
      )}
      {/* REFUND SECTION */}
      {active === 3 && (
        <div>
          <AllRefundOrders />
        </div>
      )}
      {/* TRACK ORDER */}
      {active === 5 && (
        <div>
          <TrackOrder />
        </div>
      )}
      {/* ADDRESS SECTION */}
      {active === 6 && (
        <div>
          <Address />
        </div>
      )}
    </div>
  );
};

const AllOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 300, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      cellClassName: (params) =>
        params.value === "Delivered" ? "text-green-600" : "text-red-600",
    },
    { field: "itemsQty", headerName: "Items Qty", type: "number", minWidth: 130, flex: 0.7 },
    { field: "total", headerName: "Total", type: "number", minWidth: 130, flex: 0.8 },
    {
      field: "actions",
      flex: 1,
      minWidth: 150,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/order/${params.id}`}>
          <Button><AiOutlineArrowRight size={20} /></Button>
        </Link>
      ),
    },
  ];

  const rows = orders?.map((item) => ({
    id: item._id,
    itemsQty: item.cart?.reduce((acc, i) => acc + i.qty, 0) || 0,
    total: "US$ " + item.totalPrice,
    status: item.status,
  })) || [];

  return (
    <div className="pl-8 pt-1">
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </div>
  );
};

const AllRefundOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const eligibleOrders = orders?.filter((item) => item.status === "Processing refund") || [];

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 300, flex: 1 },
    { field: "status", headerName: "Status", minWidth: 130, flex: 0.7 },
    { field: "itemsQty", headerName: "Items Qty", type: "number", minWidth: 130, flex: 0.7 },
    { field: "total", headerName: "Total", type: "number", minWidth: 130, flex: 0.8 },
    {
      field: "actions",
      flex: 1,
      minWidth: 150,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/order/${params.id}`}>
          <Button><AiOutlineArrowRight size={20} /></Button>
        </Link>
      ),
    },
  ];

  const rows = eligibleOrders.map((item) => ({
    id: item._id,
    itemsQty: item.cart?.reduce((acc, i) => acc + i.qty, 0) || 0,
    total: "US$ " + item.totalPrice,
    status: item.status,
  }));

  return (
    <div className="pl-8 pt-1">
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </div>
  );
};

const TrackOrder = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 300, flex: 1 },
    { field: "status", headerName: "Status", minWidth: 130, flex: 0.7 },
    { field: "itemsQty", headerName: "Items Qty", type: "number", minWidth: 130, flex: 0.7 },
    { field: "total", headerName: "Total", type: "number", minWidth: 130, flex: 0.8 },
    {
      field: "actions",
      flex: 1,
      minWidth: 150,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/track/order/${params.id}`}>
          <Button><MdTrackChanges size={20} /></Button>
        </Link>
      ),
    },
  ];

  const rows = orders?.map((item) => ({
    id: item._id,
    itemsQty: item.cart?.reduce((acc, i) => acc + i.qty, 0) || 0,
    total: "US$ " + item.totalPrice,
    status: item.status,
  })) || [];

  return (
    <div className="pl-8 pt-1">
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </div>
  );
};

const Address = () => {
  const { user } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressType, setAddressType] = useState("");
  const dispatch = useDispatch();

  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!country || !city || !address1 || !addressType) {
      toast.error("Please fill all required fields!");
      return;
    }
    dispatch(updateUserAddress(country, city, address1, address2, zipCode, addressType));
    setOpen(false);
    setCountry("");
    setCity("");
    setAddress1("");
    setAddress2("");
    setZipCode("");
    setAddressType("");
  };

  const handleDelete = (item) => {
    dispatch(deleteUserAddress(item._id));
  };

  return (
    <div className="w-full px-5">
      {open && (
        <div className="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center z-50">
          <div className="w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll p-4">
            <div className="flex justify-end w-full">
              <RxCross1 size={25} className="cursor-pointer" onClick={() => setOpen(false)} />
            </div>
            <h1 className="text-center text-[25px] font-Poppins">Add New Address</h1>
            <div className="w-full">
              <form onSubmit={handleSubmit}>
                <div className="w-full pb-2">
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
                <div className="w-full pb-2">
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
                <div className="w-full pb-2">
                  <label className="block pb-2">Address 1 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={styles.input}
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                </div>
                <div className="w-full pb-2">
                  <label className="block pb-2">Address 2 <span className="text-gray-400 text-sm">(optional)</span></label>
                  <input
                    type="text"
                    className={styles.input}
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                </div>
                <div className="w-full pb-2">
                  <label className="block pb-2">Zip Code</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="w-full pb-2">
                  <label className="block pb-2">Address Type <span className="text-red-500">*</span></label>
                  <select
                    className="w-full border h-[35px] rounded-[5px]"
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                  >
                    <option value="">Choose address type</option>
                    {addressTypeData.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className={`${styles.button} mt-4 text-white`}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="flex w-full items-center justify-between">
        <h1 className="text-[25px] font-[600] text-[#000000ba] pb-2">My Addresses</h1>
        <div
          className={`${styles.button} !rounded-md text-white`}
          onClick={() => setOpen(true)}
        >
          Add New
        </div>
      </div>
      <br />
      {user?.addresses?.map((item, index) => (
        <div
          className="w-full bg-white h-min 800px:h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 mb-5"
          key={index}
        >
          <div className="flex items-center">
            <h5 className="pl-5 font-[600]">{item.addressType}</h5>
          </div>
          <div className="pl-8 flex items-center">
            <h6 className="text-[12px] 800px:text-[unset]">
              {item.address1} {item.address2}
            </h6>
          </div>
          <div className="pl-8 flex items-center">
            <h6 className="text-[12px] 800px:text-[unset]">
              {Country.getCountryByCode(item.country)?.name}
            </h6>
          </div>
          <div className="pl-8 flex items-center">
            <h6 className="text-[12px] 800px:text-[unset]">{user?.phoneNumber}</h6>
          </div>
          <div className="min-w-[10%] flex items-center justify-between pl-8">
            <AiOutlineDelete
              size={25}
              className="cursor-pointer"
              onClick={() => handleDelete(item)}
            />
          </div>
        </div>
      ))}
      {user?.addresses?.length === 0 && (
        <h5 className="text-center pt-8 text-[18px]">No saved addresses!</h5>
      )}
    </div>
  );
};

export default ProfileContent;

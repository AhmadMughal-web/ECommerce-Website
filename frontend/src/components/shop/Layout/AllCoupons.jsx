import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import Loader from "../../layout/loader";
import { DataGrid } from "@mui/x-data-grid";
import styles from "../../../styles/style";
import { useState as useLocalState } from "react";
import { RxCross1 } from "react-icons/rx";
import { server } from "../../../server";
import axios from "axios";
import { toast } from "react-toastify";
import { getAllProductsShop } from "../../../redux/actions/product";

const AllCoupons = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [value, setValue] = useState(null);
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!seller?._id) return;
    dispatch(getAllProductsShop(seller._id));
    setIsLoading(true);
    // FIXED: was "/coupon/get-coupon/:id/${seller._id}" — ":id" was literal string
    axios
      .get(`${server}/coupon/get-coupon/${seller._id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setIsLoading(false);
        setCoupons(res.data.couponCodes || []);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Failed to load coupons:", error?.response?.data?.message);
      });
  }, [seller?._id, dispatch]);

  // FIXED: was dispatching deleteProduct — should call coupon delete API
  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/coupon/delete-coupon/${id}`, { withCredentials: true })
      .then(() => {
        toast.success("Coupon deleted successfully!");
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Delete failed");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(
        `${server}/coupon/create-coupon-code`,
        { name, minAmount, maxAmount, selectedProducts, value, shop: seller },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Coupon code created successfully!");
        setOpen(false);
        setCoupons((prev) => [...prev, res.data.couponCode]);
        setName("");
        setValue(null);
        setMinAmount(null);
        setMaxAmount(null);
        setSelectedProducts(null);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Failed to create coupon");
      });
  };

  const columns = [
    { field: "id", headerName: "Coupon ID", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Coupon Code", minWidth: 180, flex: 1.4 },
    { field: "value", headerName: "Discount %", minWidth: 100, flex: 0.6 },
    { field: "minAmount", headerName: "Min Amount", minWidth: 100, flex: 0.6 },
    { field: "maxAmount", headerName: "Max Amount", minWidth: 100, flex: 0.6 },
    {
      field: "delete",
      headerName: "Delete",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <button onClick={() => handleDelete(params.id)}>
          <AiOutlineDelete size={20} />
        </button>
      ),
    },
  ];

  const rows = coupons.map((item) => ({
    id: item._id,
    name: item.name,
    value: item.value + " %",
    minAmount: item.minAmount || "N/A",
    maxAmount: item.maxAmount || "N/A",
  }));

  return (
    <>
      <div className="w-full mx-8 pt-1 mt-10 bg-white">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-[22px] font-Poppins">All Coupons</h3>
          <div
            className={`${styles.button} !rounded-md text-white mr-4`}
            onClick={() => setOpen(true)}
          >
            Create Coupon
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10]}
            disableRowSelectionOnClick
            autoHeight
          />
        )}
      </div>

      {open && (
        <div className="fixed top-0 left-0 w-full h-screen bg-[#00000031] z-[9999] flex items-center justify-center">
          <div className="w-[90%] 800px:w-[40%] h-[80vh] bg-white rounded shadow p-4 overflow-y-scroll">
            <div className="flex justify-end w-full cursor-pointer">
              <RxCross1 size={25} onClick={() => setOpen(false)} />
            </div>
            <h5 className="text-[30px] font-Poppins text-center">Create Coupon Code</h5>
            <form onSubmit={handleSubmit}>
              <div className="mt-5">
                <label className="pb-2">Coupon Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter coupon code name..."
                  className={`${styles.input} mt-2`}
                />
              </div>
              <div className="mt-5">
                <label className="pb-2">Discount % <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  value={value || ""}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter coupon value..."
                  className={`${styles.input} mt-2`}
                />
              </div>
              <div className="mt-5">
                <label className="pb-2">Min Amount</label>
                <input
                  type="number"
                  value={minAmount || ""}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Min order amount..."
                  className={`${styles.input} mt-2`}
                />
              </div>
              <div className="mt-5">
                <label className="pb-2">Max Amount</label>
                <input
                  type="number"
                  value={maxAmount || ""}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Max order amount..."
                  className={`${styles.input} mt-2`}
                />
              </div>
              <div className="mt-5">
                <label className="pb-2">Select Product (optional)</label>
                <select
                  className="w-full border h-[35px] rounded-[5px] mt-2"
                  value={selectedProducts || ""}
                  onChange={(e) => setSelectedProducts(e.target.value)}
                >
                  <option value="">Choose a product</option>
                  {products && products.map((p) => (
                    <option key={p._id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className={`${styles.button} mt-6 text-white`}
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AllCoupons;

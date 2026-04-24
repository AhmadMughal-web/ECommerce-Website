import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@mui/x-data-grid";
import styles from "../../styles/style";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/user/delete-user/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        dispatch(getAllUsers()); // FIXED: moved inside .then so it runs after delete
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Delete failed");
      });
  };

  const columns = [
    { field: "id", headerName: "User ID", minWidth: 200, flex: 1 },
    { field: "name", headerName: "Name", minWidth: 150, flex: 0.7 },
    { field: "email", headerName: "Email", type: "text", minWidth: 130, flex: 0.7 },
    { field: "role", headerName: "User Role", type: "text", minWidth: 130, flex: 0.7 },
    { field: "joinedAt", headerName: "Joined At", type: "text", minWidth: 130, flex: 0.8 },
    {
      field: " ",
      flex: 1,
      minWidth: 150,
      headerName: "Delete User",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => { setUserId(params.id); setOpen(true); }}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows = [];
  // FIXED: removed console.log(users)
  users &&
    users.forEach((item) => {
      rows.push({
        id: item._id,
        name: item.name,
        email: item.email,
        role: item.role,
        joinedAt: item.createdAt?.slice(0, 10),
      });
    });

  return (
    <div className="w-full flex justify-center pt-5">
      <div className="w-[97%]">
        <h3 className="text-[22px] font-Poppins pb-2">All Users</h3>
        <div className="w-full min-h-[45vh] bg-white rounded">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10]}
            disableRowSelectionOnClick
            autoHeight
          />
        </div>
        {open && (
          <div className="w-full fixed top-0 left-0 z-[999] bg-[#00000039] flex items-center justify-center h-screen">
            <div className="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded shadow p-5">
              <div className="w-full flex justify-end cursor-pointer">
                <RxCross1 size={25} onClick={() => setOpen(false)} />
              </div>
              <h3 className="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">
                Are you sure you want to delete this user?
              </h3>
              <div className="w-full flex items-center justify-center">
                <div
                  className={`${styles.button} text-white text-[18px] !h-[42px] mr-4`}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </div>
                <div
                  className={`${styles.button} text-white text-[18px] !h-[42px] ml-4`}
                  onClick={() => { setOpen(false); handleDelete(userId); }}
                >
                  Confirm
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;

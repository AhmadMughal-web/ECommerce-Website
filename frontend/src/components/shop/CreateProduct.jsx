import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "../../static/data";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { createProduct } from "../../redux/actions/product";
import { toast } from "react-toastify";
import axios from "axios";
const CreateProduct = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.products);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscouontPrice] = useState("");
  const [stock, setStock] = useState("");
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Product created Successfuly");
      navigate("/dashboard");
      window.location.reload();
    }
  }, [dispatch, error, success]);

const handleSubmit = (e) => {
  e.preventDefault();

  const productData = {
    name,
    description,
    category,
    tags,
    originalPrice,
    discountPrice,
    stock,
    shopId: seller._id,
    images, // these are already Cloudinary URLs
  };

  dispatch(createProduct(productData));
};


  // const handleImageSubmit = (e) => {
  //   e.preventDefault();
  //   let files = Array.from(e.target.files);
  //   setImages((prevImages) => [...prevImages, ...files]);
  // };

  const handleImageSubmit = async (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ecommrence"); // must exist in Cloudinary
      data.append("cloud_name", "du6xqru9r");

      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/du6xqru9r/image/upload",
          data
        );

        if (res.data.secure_url) {
          setImages((prev) => [...prev, res.data.secure_url]);
        } else {
          toast.error("Image upload failed!");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error uploading image");
      }
    }
  };

  return (
    <div className=" w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] p-3 overflow-y-scroll">
      <h5 className="text-xl font-Poppins text-center">Create Product</h5>
      {/* CREATE PRODUCT FORM */}
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className="pb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your product name..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            cols="30"
            rows="8"
            required
            type="text"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border mt-2 appearance-none block w-full pt-2 px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Your Product  Description ..."
          >
            {" "}
          </textarea>
        </div>
        <br />
        <div>
          <label className="pb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Choose a Category"> Choose a Category</option>
            {categoriesData &&
              categoriesData.map((i) => (
                <option value={i.title} key={i.title}>
                  {i.title}
                </option>
              ))}
          </select>
        </div>
        <br />
        <div>
          <label className="pb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your Tag Name"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Original Price</label>
          <input
            type="text"
            name="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Product Price"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Price (with Discount) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={discountPrice}
            onChange={(e) => setDiscouontPrice(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Discount Price"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Product Stock"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Upload Images <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="upload"
            className="hidden"
            multiple
            onChange={handleImageSubmit}
          />
          <div className="w-full flex items-center flex-wrap">
            <label htmlFor="upload">
              <AiOutlinePlusCircle size={30} color="#555" className="mt-2" />
            </label>
            {images &&
              images.map((i) => (
                <img
                  src={i}
                  key={i}
                  alt=""
                  className="h-[120px] w-[120px] object-cover m-2"
                />
              ))}
          </div>
          <br />
          <div>
            <input
              type="submit"
              value="Create"
              className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;

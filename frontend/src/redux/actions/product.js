import axios from "axios";
import { server } from "../../server";

// CREATE PRODUCT
export const createProduct = (productData) => async (dispatch) => {
  try {
    dispatch({ type: "productCreateRequest" });

    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.post(
      `${server}/product/create-product`,
      productData,
      config
    );

    dispatch({ type: "productCreateSuccess", payload: data.product });
  } catch (error) {
    dispatch({
      type: "productCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};


// GET ALL PRODUCTS (shop-specific)
export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({ type: "getAllProductsShopRequest" });
    const { data } = await axios.get(
      `${server}/product/get-all-products-shop/${id}`
    );
    dispatch({ type: "getAllProductsShopSuccess", payload: data.products });
  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// GET ALL PRODUCTS (global)  <-- NEW
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllProductsRequest" });

    const { data } = await axios.get(`${server}/product/get-all-products`);
    console.log("API getAllProducts response:", data);

    dispatch({ type: "getAllProductsSuccess", payload: data.products });
  } catch (error) {
    dispatch({
      type: "getAllProductsFailed",
      payload: error.response?.data?.message,
    });
  }
};

// DELETE A PRODUCT
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteProductRequest" });
    await axios.delete(`${server}/product/delete-shop-product/${id}`, {
      withCredentials: true,
    });
    dispatch({ type: "deleteProductSuccess", payload: id });
  } catch (error) {
    dispatch({
      type: "deleteProductFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

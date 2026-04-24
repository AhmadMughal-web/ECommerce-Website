import { createReducer } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem("cartItems");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to parse cartItems from localStorage:", err);
    return [];
  }
};

const initialState = {
  cart: loadCartFromStorage(),
};

export const cartReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("addToCart", (state, action) => {
      const item = action.payload;
      const exist = state.cart.find((i) => i._id === item._id);

      if (exist) {
        // immer allows direct mutation
        state.cart = state.cart.map((i) => (i._id === exist._id ? item : i));
      } else {
        state.cart.push(item);
      }
    })
    .addCase("removeFromCart", (state, action) => {
      const id = action.payload;
      state.cart = state.cart.filter((i) => i._id !== id);
    });
});

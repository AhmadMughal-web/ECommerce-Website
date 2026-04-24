import { createReducer } from "@reduxjs/toolkit";

const loadWishlistFromStorage = () => {
  try {
    const raw = localStorage.getItem("wishlistItems");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to parse wishlistItems from localStorage:", err);
    return [];
  }
};

const initialState = {
  wishlist: loadWishlistFromStorage(),
};

export const wishlistReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("addToWishlist", (state, action) => {
      const item = action.payload;
      const exist = state.wishlist.find((i) => i._id === item._id);

      if (exist) {
        // immer allows direct mutation
        state.wishlist = state.wishlist.map((i) =>
          i._id === exist._id ? item : i
        );
      } else {
        state.wishlist.push(item);
      }
    })
    .addCase("removeFromWishlist", (state, action) => {
      const id = action.payload;
      state.wishlist = state.wishlist.filter((i) => i._id !== id);
    });
});

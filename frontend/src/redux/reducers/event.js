import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const eventReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("eventCreateRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("eventCreateSuccess", (state, action) => {
      state.isLoading = false;
      state.event = action.payload;
      state.success = true;
    })
    .addCase("eventCreateFail", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.success = false;
    })

    // get all events of shop
    .addCase("getAlleventsShopRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("getAlleventsShopSuccess", (state, action) => {
      state.isLoading = false;
      state.events = action.payload;
    })
    .addCase("getAlleventsShopFail", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // delete event of shop
    .addCase("deleteeventRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("deleteeventSuccess", (state, action) => {
      state.isLoading = false;
      state.message = action.payload;
    })
    .addCase("deleteeventFail", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // get all events
    .addCase("getAlleventsRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("getAlleventsSuccess", (state, action) => {
      state.isLoading = false;
      state.allEvents = action.payload;
    })
    .addCase("getAlleventsFail", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // clear errors
    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});

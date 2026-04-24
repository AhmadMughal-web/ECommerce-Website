import React from "react";
import ReactDOM from "react-dom/client"; // 👈 Notice this change
import App from "./App";
import { Provider } from "react-redux";
import Store from "./redux/store";

// Create root using React 18 API
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={Store}>
    <App />
  </Provider>
);

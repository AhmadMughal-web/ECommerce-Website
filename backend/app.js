const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

// FIXED: single dotenv call — was duplicated in original
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/.env" });
}

// FIXED: CORS now supports both local dev and production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "PRODUCTION"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // FIXED: removed bodyParser dependency — express has this built-in
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.get("/test", (req, res) => {
  res.send("Hello world!");
});

// IMPORT ROUTES
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const messages = require("./controller/messages");
const withdraw = require("./controller/withdraw");

app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/messages", messages);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/order", order);
app.use("/api/v2/withdraw", withdraw);

// ERROR HANDLING MIDDLEWARE
app.use(ErrorHandler);

module.exports = app;

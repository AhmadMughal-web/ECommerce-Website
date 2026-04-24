const app = require("./app");
const connectDB = require("./db/dataBase");
const cloudinary = require("cloudinary");

// FIXED: single dotenv call with correct path — was called twice with different paths
require("dotenv").config({ path: "./config/.env" });

// FIXED: removed unused `payment` import — was imported but never used in server.js

const express = require("express");
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// HANDLING UNCAUGHT EXCEPTIONS
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to uncaught exception");
  process.exit(1);
});

// CONNECT DB
connectDB();

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CREATE SERVER
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// UNHANDLED PROMISE REJECTION
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down server: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

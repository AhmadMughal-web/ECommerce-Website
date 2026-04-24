const app = require("./app");
const connectDB = require("./db/dataBase");
const cloudinary = require("cloudinary");
const express = require("express");
const path = require("path");

// FIXED: single dotenv config — Render env vars directly inject hoti hain
// "config/.env" path Render par exist nahi karta — wahan env vars dashboard se aati hain
require("dotenv").config({ path: "./config/.env" });

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// HANDLING UNCAUGHT EXCEPTIONS
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down server for uncaught exception`);
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

// FIXED: fallback to 8000 if PORT not set
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// UNHANDLED PROMISE REJECTION
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down server: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

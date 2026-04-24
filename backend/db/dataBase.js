const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const data = await mongoose.connect(process.env.DB_URL);

    console.log(`MongoDB connected: ${data.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
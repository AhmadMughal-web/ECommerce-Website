const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
      },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      isReviewed: { type: Boolean, default: false },
    },
  ],

  shippingAddress: {
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  totalPrice: {
    type: Number,
    required: true,
  },

  // FIXED: added "Processing refund" and "Refund Success" to enum
  // Frontend sends these statuses — without them validation fails
  status: {
    type: String,
    default: "Processing",
    enum: [
      "Processing",
      "Transferred to delivery partner",
      "Shipped",
      "Received",
      "On the way",
      "Delivered",
      "Processing refund",
      "Refund Success",
      "Cancelled",
    ],
  },

  paymentInfo: {
    id: { type: String },
    status: { type: String },
    type: { type: String },
  },

  paidAt: {
    type: Date,
    default: Date.now,
  },

  deliveredAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);

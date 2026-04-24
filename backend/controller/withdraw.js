const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const Withdraw = require("../model/withdraw");
const sendMail = require("../utils/sendMail");
const router = express.Router();

// CREATE WITHDRAW REQUEST — SELLER
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return next(new ErrorHandler("Please provide a valid amount", 400));
      }

      const shop = await Shop.findById(req.seller._id);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      if (shop.availableBalance < amount) {
        return next(new ErrorHandler("Insufficient balance", 400));
      }

      // FIXED: was sending response inside the sendMail try block (before withdraw was created)
      // Then sending ANOTHER response after — "Cannot set headers after they are sent" crash
      // Now: create withdraw first, deduct balance, then send email, then respond once

      const data = { seller: req.seller, amount };
      const withdraw = await Withdraw.create(data);

      shop.availableBalance = shop.availableBalance - amount;
      await shop.save();

      // Send email (non-blocking — don't crash if email fails)
      try {
        await sendMail({
          email: req.seller.email,
          subject: "Withdraw Request Received",
          message: `Hello ${req.seller.name}, Your withdraw request of $${amount} is being processed. It will take 3-7 days.`,
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError.message);
        // Don't return next(error) — withdraw was already created successfully
      }

      // FIXED: single response only
      res.status(201).json({ success: true, withdraw });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET ALL WITHDRAW REQUESTS — ADMIN
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, withdraws });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE WITHDRAW REQUEST — ADMIN
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      const withdraw = await Withdraw.findByIdAndUpdate(
        req.params.id,
        { status: "succeed", updatedAt: Date.now() },
        { new: true }
      );

      if (!withdraw) {
        return next(new ErrorHandler("Withdraw request not found", 404));
      }

      const seller = await Shop.findById(sellerId);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      const transaction = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      if (!Array.isArray(seller.transections)) {
        seller.transections = [];
      }
      seller.transections.push(transaction);
      await seller.save();

      // Send email (non-blocking)
      try {
        await sendMail({
          email: seller.email,
          subject: "Payment Confirmation",
          message: `Hello ${seller.name}, Your withdraw of $${withdraw.amount} has been processed. It usually takes 3-7 business days.`,
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError.message);
      }

      res.status(200).json({ success: true, withdraw });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

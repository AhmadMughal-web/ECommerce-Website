const CoupounCode = require("../model/coupounCode");
const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");

// CREATE COUPON CODE
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const existing = await CoupounCode.findOne({ name: req.body.name });
      if (existing) {
        return next(new ErrorHandler("Coupon code already exists!", 400));
      }

      const coupon = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        couponCode: coupon,
        message: "Coupon code created successfully.",
      });
    } catch (error) {
      let message = "Something went wrong";
      if (error.name === "ValidationError") {
        message = Object.values(error.errors).map((e) => e.message).join(", ");
      } else if (error.code === 11000) {
        message = "Duplicate key error: " + JSON.stringify(error.keyValue);
      } else if (error.message) {
        message = error.message;
      }
      return next(new ErrorHandler(message, 400));
    }
  })
);

// GET ALL COUPONS OF A SHOP
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({
        "shop._id": req.params.id,
      });

      res.status(200).json({ success: true, couponCodes });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// DELETE COUPON CODE
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);
      if (!couponCode) {
        return next(new ErrorHandler("Coupon code doesn't exist!", 400));
      }
      res.status(200).json({ success: true, message: "Coupon code deleted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// GET COUPON VALUE BY NAME

router.get(
  "/get-coupon-value/:name",
  catchAsyncError(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });
      res.status(200).json({ success: true, couponCode });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;

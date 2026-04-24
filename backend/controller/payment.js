const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");

// Stripe initialized with secret key from env
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// PROCESS PAYMENT
router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        // NOTE: "pkr" (Pakistani Rupee) is not supported by Stripe
        // Use "usd" for testing. Change to your supported currency in production.
        currency: "usd",
        metadata: {
          company: "E-Shop",
        },
      });

      res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET STRIPE API KEY
router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

module.exports = router;

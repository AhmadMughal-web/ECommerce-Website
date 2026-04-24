const express = require("express");
const router = express.Router();
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");

// CREATE ORDER
router.post(
  "/create-order",
  catchAsyncError(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      // FIXED: removed console.log(shippingAddress) — private user data was being logged
      if (!shippingAddress?.city || !shippingAddress?.zipCode || !shippingAddress?.phoneNumber) {
        return next(new ErrorHandler("Complete shipping address is required", 400));
      }

      // Group cart items by shopId
      const shopItemsMap = new Map();
      for (const item of cart) {
        const normalizedItem = {
          productId: item._id || item.productId,
          shopId: item.shopId,
          name: item.name,
          qty: item.qty,
          price: item.price || item.discountPrice,
          image: item.image,
        };
        if (!shopItemsMap.has(item.shopId)) {
          shopItemsMap.set(item.shopId, []);
        }
        shopItemsMap.get(item.shopId).push(normalizedItem);
      }

      // Create an order for each shop
      const orders = [];
      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user: user._id || user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({ success: true, orders });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// GET ALL ORDERS OF USER
router.get(
  "/get-all-orders/:userId",
  catchAsyncError(async (req, res, next) => {
    try {
      const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, orders });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET ALL ORDERS OF SELLER
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncError(async (req, res, next) => {
    try {
      // FIXED: was req.params.id — param name is "shopId" not "id"
      const shopId = req.params.shopId;
      const orders = await Order.find({ "cart.shopId": shopId }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, orders });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE ORDER STATUS — SELLER
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      if (req.body.status === "Transferred to delivery partner") {
        for (const o of order.cart) {
          await updateProductStock(o.productId, o.qty);
        }
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        // FIXED: was seller.availableBalance = amount (overwrite), should be += (accumulate)
        await updateSellerBalance(req.seller._id, order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({ success: true, order });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Helper functions defined BEFORE they are used — not after res.status()
async function updateProductStock(id, qty) {
  const product = await Product.findById(id);
  if (product) {
    product.stock -= qty;
    product.sold_out += qty;
    await product.save({ validateBeforeSave: false });
  }
}

async function updateSellerBalance(sellerId, amount) {
  const seller = await Shop.findById(sellerId);
  if (seller) {
    seller.availableBalance += amount; // FIXED: was = (overwrite), now += (accumulate)
    await seller.save();
  }
}

// REFUND REQUEST — USER
router.put(
  "/order-refund/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;
      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order refund request submitted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ACCEPT REFUND — SELLER
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;
      await order.save();

      
      // Now it runs BEFORE sending the response
      if (req.body.status === "Refund Success") {
        for (const o of order.cart) {
          const product = await Product.findById(o.productId);
          if (product) {
            product.stock += o.qty;
            product.sold_out -= o.qty;
            await product.save({ validateBeforeSave: false });
          }
        }
      }

      res.status(200).json({ success: true, message: "Order refund successful!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ALL ORDERS — ADMIN
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, orders });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

const express = require("express");
const Product = require("../model/product");
const Order = require("../model/order");
const router = express.Router();
const catchAsyncError = require("../middleware/catchAsyncError");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

// CREATE A NEW  PRODUCT
router.post(
  "/create-product",
  catchAsyncError(async (req, res, next) => {
    const {
      shopId,
      name,
      description,
      category,
      tags,
      originalPrice,
      discountPrice,
      stock,
      images,
    } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) return next(new ErrorHandler("Shop Id is invalid!", 400));

    const product = await Product.create({
      name,
      description,
      category,
      tags,
      originalPrice,
      discountPrice,
      stock,
      shopId,
      shop,
      images: images.map((img) => (typeof img === "string" ? img : img.url)),
    });

    res.status(201).json({ success: true, product });
  })
);

// GET ALL PRODUCTS FOR ALL PRODUCTS
router.get(
  "/get-all-products-shop/:id",
  catchAsyncError(async (req, resp, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });
      resp.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all product
router.get("/get-all-products", async (req, resp, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    resp.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// DELETE PRODUCT OF A SHOP
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncError(async (req, resp, next) => {
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found with this ID", 404));
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      for (let img of product.images) {
        // If images stored as filenames
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          img.filename || img
        );
        try {
          await fs.promises.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          console.warn(`Failed to delete file (${filePath}):`, err.message);
        }
      }
    }

    // Delete the product from DB
    await product.deleteOne();

    resp.status(200).json({
      success: true,
      message: "Product deleted successfully along with images!",
    });
  })
);

// reviews for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const product = await Product.findById(productId);

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Reviwed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

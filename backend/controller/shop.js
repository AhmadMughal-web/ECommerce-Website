const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop");
const { upload } = require("../multer");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendShopToken = require("../utils/shopToken");
const cloudinary = require("cloudinary");

// CREATE SHOP
router.post(
  "/create-shop",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });

      if (sellerEmail) {
        // FIXED: was using undefined "filePath" — now correctly using req.file
        if (req.file) {
          const filePath = path.join(__dirname, "../uploads", req.file.filename);
          try {
            await fs.promises.unlink(filePath);
          } catch (err) {
            console.error("Failed to delete uploaded file:", err.message);
          }
        }
        return next(new ErrorHandler("Shop already exists", 400));
      }

      if (!req.file) {
        return next(new ErrorHandler("Please upload a shop avatar", 400));
      }

      // Upload to cloudinary
      const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "shop-avatars",
      });

      // Clean up local file
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err.message);
      }

      const seller = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };

      const activationToken = createActivationToken(seller);

      // FIXED: hardcoded URL replaced with env variable
      const activationUrl = `${process.env.FRONTEND_URL}/seller/activation/${activationToken}`;

      await sendMail({
        email: seller.email,
        subject: "Activate your Shop",
        message: `Hello ${seller.name}, Please click the link to activate your Shop: ${activationUrl}`,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email (${seller.email}) to activate your Shop.`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// CREATE ACTIVATION TOKEN
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, { expiresIn: "2h" });
};

// ACTIVATE SHOP
router.post(
  "/activation",
  catchAsyncError(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      // FIXED: was calling jwt.verify twice — removed duplicate outer scope call
      const newSeller = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

      if (!newSeller) {
        return next(new ErrorHandler("Invalid Token", 400));
      }

      const { name, email, password, avatar, zipCode, phoneNumber, address } = newSeller;

      let seller = await Shop.findOne({ email });
      if (seller) {
        return next(new ErrorHandler("Shop already exists", 400));
      }

      seller = await Shop.create({
        name, email, avatar, password, zipCode, phoneNumber, address,
      });

      // FIXED: removed console.log("Decoded activation token:", newUser) after sendShopToken
      // newUser was undefined (wrong variable name), and response was already sent
      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGIN SHOP
router.post(
  "/login-shop",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }

      const shop = await Shop.findOne({ email }).select("+password");
      if (!shop) {
        return next(new ErrorHandler("Shop doesn't exist!", 400));
      }

      const isPasswordValid = await shop.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Please provide correct information", 400));
      }

      sendShopToken(shop, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOAD SELLER
router.get(
  "/getSeller",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new ErrorHandler("Shop doesn't exist", 400));
      }
      res.status(200).json({ success: true, seller });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGOUT SHOP
router.get(
  "/logout",
  catchAsyncError(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET SHOP INFO
router.get(
  "/get-shop-info/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(200).json({ success: true, shop });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE SHOP AVATAR
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncError(async (req, res, next) => {
    try {
      const shopId = req.seller?._id;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      if (!req.file) {
        return next(new ErrorHandler("Please upload an image", 400));
      }

      // Delete old avatar from cloudinary
      if (shop.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(shop.avatar.public_id);
      }

      // Upload new avatar
      const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "shop-avatars",
      });

      // Clean up local file
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err.message);
      }

      const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { avatar: { public_id: myCloud.public_id, url: myCloud.secure_url } },
        { new: true, runValidators: true }
      ).select("-password");

      return res.status(200).json({ success: true, shop: updatedShop });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE SELLER INFO
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      // FIXED: was Shop.findOne(req.seller._id) — findOne needs filter object
      const shop = await Shop.findById(req.seller._id);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(200).json({ success: true, shop });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ALL SELLERS — ADMIN
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, sellers });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE SELLER — ADMIN
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"), // FIXED: was isAdmin() without role — always returned 403
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }
      await Shop.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Seller deleted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE WITHDRAW METHOD
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;
      const seller = await Shop.findByIdAndUpdate(
        req.seller._id,
        { withdrawMethod },
        { new: true }
      );
      res.status(200).json({ success: true, seller });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE WITHDRAW METHOD
router.delete(
  "/delete-withdraw-method",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 400));
      }
      seller.withdrawMethod = null;
      await seller.save();
      res.status(200).json({ success: true, seller });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

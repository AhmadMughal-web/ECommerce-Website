const express = require("express");
const { upload } = require("../multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const cloudinary = require("cloudinary");
const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const mongoose = require("mongoose");

// CREATE USER — DIRECT (no email verification)
router.post(
  "/create-user",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const userEmail = await User.findOne({ email });
      if (userEmail) {
        if (req.file) {
          const filePath = path.join(__dirname, "../uploads", req.file.filename);
          try { await fs.promises.unlink(filePath); } catch (e) { }
        }
        return next(new ErrorHandler("User already exists", 400));
      }

      if (!req.file) {
        return next(new ErrorHandler("Please upload an avatar image", 400));
      }

      // Upload to cloudinary
      const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "avatars",
      });

      // Delete local file after upload
      try { await fs.promises.unlink(req.file.path); } catch (e) { }

      // FIXED: Create user directly — no email verification needed
      const user = await User.create({
        name,
        email,
        password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });

      // Send token directly — user logged in immediately
      sendToken(user, 201, res);

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// LOGIN USER
router.post(
  "/login-user",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields", 400));
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User doesn't exist!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Please provide correct information", 400));
      }

      sendToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOAD USER
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGOUT
router.get(
  "/logout",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER INFO
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { name, email, phoneNumber, password } = req.body;

      if (!password) {
        return next(new ErrorHandler("Please provide your current password", 400));
      }

      const user = await User.findById(req.user._id).select("+password");
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      await user.save();
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER AVATAR
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncError(async (req, res, next) => {
    try {
      const existsUser = await User.findById(req.user._id);
      if (!existsUser) return next(new ErrorHandler("User not found", 404));
      if (!req.file) return next(new ErrorHandler("Please upload an image", 400));

      if (existsUser.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(existsUser.avatar.public_id);
      }

      const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "avatars",
      });

      try { await fs.promises.unlink(req.file.path); } catch (e) { }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: { public_id: myCloud.public_id, url: myCloud.secure_url } },
        { new: true }
      ).select("-password");

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER ADDRESS
router.put(
  "/update-user-address",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(new ErrorHandler(`${req.body.addressType} address already exists`, 400));
      }

      const existAddress = user.addresses.find(
        (address) => address._id.toString() === req.body._id
      );

      if (existAddress) {
        Object.assign(existAddress, req.body);
      } else {
        user.addresses.push(req.body);
      }

      await user.save();
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE USER ADDRESS
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return next(new ErrorHandler("Invalid address id", 400));
      }

      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER PASSWORD
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select("+password");

      const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords don't match!", 400));
      }

      user.password = req.body.newPassword;
      await user.save();

      res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET USER INFO BY ID
router.get(
  "/user-info/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET ALL USERS — ADMIN
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, users });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE USER — ADMIN
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return next(new ErrorHandler("User not found with this id", 400));
      }
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "User deleted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
const express = require("express");
const { upload } = require("../multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const router = express.Router();
const cloudinary = require("cloudinary");
const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const mongoose = require("mongoose");

// CREATE A USER
router.post(
  "/create-user",
  upload.single("file"),
  async (req, res, next) => {
    try {
      // FIXED: removed console.log statements from production code
      const { name, email, password } = req.body;

      const userEmail = await User.findOne({ email });

      if (userEmail) {
        // FIXED: was using undefined "filePath" — now correctly using req.file.path
        if (req.file) {
          const filePath = path.join(__dirname, "../uploads", req.file.filename);
          try {
            await fs.promises.unlink(filePath);
          } catch (err) {
            console.error("Failed to delete uploaded file:", err.message);
          }
        }
        return next(new ErrorHandler("User already exists", 400));
      }

      if (!req.file) {
        return next(new ErrorHandler("Please upload an avatar image", 400));
      }

      // FIXED: was passing undefined "avatar" variable to cloudinary
      // Now correctly using req.file.path
      const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "avatars",
      });

      // Clean up local file after cloudinary upload
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err.message);
      }

      const user = {
        name,
        email,
        password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      };

      const activationToken = createActivationToken(user);

      // FIXED: hardcoded URL replaced with env variable
      const activationUrl = `${process.env.FRONTEND_URL}/activation/${activationToken}`;

      await sendMail({
        email: user.email,
        name: user.name,
        subject: "Activate Your E-Shop Account",
        message: "Thank you for registering! Please click the button below to activate your account.",
        activationUrl: activationUrl,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email (${user.email}) to activate your account.`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// CREATE ACTIVATION TOKEN
const createActivationToken = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
    },
    process.env.ACTIVATION_SECRET,
    { expiresIn: "2h" }
  );
};

// ACTIVATE USER
router.post(
  "/activation",
  catchAsyncError(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      // FIXED: was calling jwt.verify twice — removed duplicate outer call
      const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

      if (!newUser) {
        return next(new ErrorHandler("Invalid Token", 400));
      }

      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      user = await User.create({ name, email, avatar, password });

      // FIXED: removed console.log after sendToken (response already sent — would cause crash)
      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
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

      // FIXED: status 200 for login (not 201 which is for creation)
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
      const userId = req.user._id;
      const existsUser = await User.findById(userId);

      if (!existsUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (!req.file) {
        return next(new ErrorHandler("Please upload an image", 400));
      }

      // Delete old avatar from cloudinary if it exists
      if (existsUser.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(existsUser.avatar.public_id);
      }

      // Upload new avatar to cloudinary
      const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "avatars",
      });

      // Clean up local file
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err.message);
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { avatar: { public_id: myCloud.public_id, url: myCloud.secure_url } },
        { new: true, runValidators: true }
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
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`, 400)
        );
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

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
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
      // FIXED: was User.find(id) — find() needs a filter object, use findById()
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
  isAdmin("Admin"), // FIXED: was isAdmin() without role — always returned 403
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
  isAdmin("Admin"), // FIXED: was isAdmin() without role — always returned 403
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

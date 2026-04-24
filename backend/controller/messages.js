const Messages = require("../model/messages");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const express = require("express");
const path = require("path");
const { upload } = require("../multer");
const router = express.Router();

// CREATE NEW MESSAGE
router.post(
  "/create-new-message",
  upload.single("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const messageData = req.body;

      if (req.file) {
       
        // multer uses req.file.filename (lowercase)
        const fileName = req.file.filename;
        const fileUrl = path.join("uploads", fileName);
        messageData.images = fileUrl;
      }

      const message = new Messages({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: messageData.images ? messageData.images : undefined,
      });

      await message.save();

      res.status(201).json({ success: true, message });
    } catch (error) {
      // FIXED: was new ErrorHandler(error.message), 500 — 500 was outside constructor
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET ALL MESSAGES BY CONVERSATION ID
router.get(
  "/get-all-messages/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const messages = await Messages.find({ conversationId: req.params.id });
      res.status(200).json({ success: true, messages });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

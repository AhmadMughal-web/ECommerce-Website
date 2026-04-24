const Conversation = require("../model/conversation");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const express = require("express");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const router = express.Router();

// CREATE NEW CONVERSATION
router.post(
  "/create-new-conversation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { groupTitle, userId, sellerId } = req.body;

      const isConversationExist = await Conversation.findOne({ groupTitle });

      if (isConversationExist) {
        return res.status(200).json({
          success: true,
          conversation: isConversationExist,
        });
      }

      const conversation = await Conversation.create({
        members: [userId, sellerId],
        groupTitle,
      });

      res.status(201).json({ success: true, conversation });
    } catch (error) {
      // FIXED: was new ErrorHandler(error), 500 — comma outside constructor
      // sahi: new ErrorHandler(error.message, 500)
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET SELLER CONVERSATIONS
router.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.id] },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(200).json({ success: true, conversation });
    } catch (error) {
      // FIXED: same ErrorHandler syntax bug
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET USER CONVERSATIONS
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.id] },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(200).json({ success: true, conversation });
    } catch (error) {
      // FIXED: same ErrorHandler syntax bug
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE LAST MESSAGE
router.put(
  "/update-last-message/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { lastMessage, lastMessageId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        req.params.id,
        { lastMessage, lastMessageId },
        { new: true }
      );

      res.status(200).json({ success: true, conversation });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

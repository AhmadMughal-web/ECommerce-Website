const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const catchAsyncError = require("../middleware/catchAsyncError");
const router = express.Router(); 
const Event = require("../model/event");
const { upload } = require("../multer");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

// create event
router.post(
  "/create-event",
  catchAsyncError(async (req, res, next) => {
    try {
      const { shopId, images, Start_Date, Finish_Date, ...rest } = req.body; 

      // Validate shop
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      if (!images || images.length === 0) {
        return next(
          new ErrorHandler("Please provide at least one image!", 400)
        );
      }

      if (!Start_Date || !Finish_Date) {
     
        return next(
          new ErrorHandler("Start_Date and Finish_Date are required!", 400)
        );
      }

      const eventData = {
        ...rest,
        images,
        shop,
        shopId,
        Start_Date, 
        Finish_Date,
      };

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        event,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all events
router.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all events of a shop
router.get(
  "/get-all-events/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400)); 
    }
  })
);

// delete product of shop
router.delete(
  "/delete-shop-event/:id",
  catchAsyncError(async (req, res, next) => {
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new ErrorHandler("Event not found with this ID", 404));
    }

    // Delete associated images
    if (event.images && event.images.length > 0) {
      for (let img of event.images) {
       
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          img.filename || img
        );
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (err) {
          console.warn(`Failed to delete file (${filePath}):`, err.message);
        }
      }
    }

    // Delete the event from DB
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully along with images!",
    });
  })
);

// all events --- for admin
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal server error";

  // WRONG MONGO DB ID
  if (err.name === "CastError") {
    const message = `Resourses not found wirh this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  // DUPLICATE KEY
  if (err.code == 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  // WRONG JWT ERROR
  if (err.name === "JsonWebTokenError") {
    const message = `Your url is invalid please try again later`;
    err = new ErrorHandler(message, 400);
  }
  // JWT EXPIRE
  if (err.name === "TokenExpiredError") {
    const message = `Your url is expired please try again`;
    err = new ErrorHandler(message, 400);
  }
  resp.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

const { AppError } = require("../utils/errorBuilder");

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    err = new AppError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `${Object.keys(err.keyValue)[0]} already exists`;
    err = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new AppError("Token has expired", 401);
  }

  // Cast error (invalid MongoDB ID)
  if (err.name === "CastError") {
    err = new AppError("Invalid ID format", 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
    },
  });
};

module.exports = errorHandler;

const jwt = require("jsonwebtoken");
const Company = require("../models/User");
const { AppError } = require("../utils/errorBuilder");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.company = await Company.findById(decoded.id);
    req.user = req.company; // For backward compatibility with existing code

    if (!req.company) {
      return next(new AppError("Company not found", 404));
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    return next(new AppError("Authentication failed", 401));
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.company = await Company.findById(decoded.id);
      req.user = req.company; // For backward compatibility
    } catch (error) {
      // Continue without company
    }
  }

  next();
};

module.exports = { protect, optionalAuth };

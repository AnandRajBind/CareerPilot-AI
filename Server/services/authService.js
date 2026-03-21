const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { buildError } = require("../utils/errorBuilder");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const register = async (name, email, password) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw buildError("User with this email already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);
  return {
    user: user.toJSON(),
    token,
  };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw buildError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw buildError("Invalid credentials", 401);
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw buildError("Invalid credentials", 401);
  }

  const token = generateToken(user._id);
  return {
    user: user.toJSON(),
    token,
  };
};

module.exports = {
  generateToken,
  register,
  login,
};

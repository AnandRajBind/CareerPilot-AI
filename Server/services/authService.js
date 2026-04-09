const jwt = require("jsonwebtoken");
const Company = require("../models/User");
const { buildError } = require("../utils/errorBuilder");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const register = async (name, email, password, companyName, industry) => {
  const companyExists = await Company.findOne({ email });
  if (companyExists) {
    throw buildError("Company with this email already exists", 400);
  }

  // Auto-calculate 3-day trial
  const trialStartDate = new Date();
  const trialEndDate = new Date(trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  const company = await Company.create({
    name,
    email,
    password,
    companyName,
    industry,
    plan: "free",
    trialStartDate,
    trialEndDate,
    isTrialActive: true,
  });

  const token = generateToken(company._id);
  return {
    company: company.toJSON(),
    token,
  };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw buildError("Please provide email and password", 400);
  }

  const company = await Company.findOne({ email }).select("+password");
  if (!company) {
    throw buildError("Invalid credentials", 401);
  }

  const isPasswordMatch = await company.matchPassword(password);
  if (!isPasswordMatch) {
    throw buildError("Invalid credentials", 401);
  }

  const token = generateToken(company._id);
  return {
    company: company.toJSON(),
    token,
  };
};

module.exports = {
  generateToken,
  register,
  login,
};

const authService = require("../services/authService");
const { buildError } = require("../utils/errorBuilder");

const register = async (req, res, next) => {
  try {
    const { name, email, password, companyName, industry } = req.validatedBody;
    const { company, token } = await authService.register(name, email, password, companyName, industry);

    res.status(201).json({
      success: true,
      data: {
        company,
        token,
        message: "Company registered successfully. Trial period activated for 3 days.",
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const { company, token } = await authService.login(email, password);

    // Calculate trial status
    const isTrialValid = company.isTrialActive && new Date() < new Date(company.trialEndDate);
    const daysRemaining = isTrialValid
      ? Math.ceil((new Date(company.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        company,
        token,
        trialStatus: {
          isActive: isTrialValid,
          daysRemaining,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  logout,
};

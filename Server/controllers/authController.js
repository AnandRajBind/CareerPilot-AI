const authService = require("../services/authService");
const { buildError } = require("../utils/errorBuilder");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.validatedBody;
    const { user, token } = await authService.register(name, email, password);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: {
        user,
        token,
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

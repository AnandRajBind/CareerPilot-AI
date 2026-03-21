const User = require("../models/User");
const { buildError } = require("../utils/errorBuilder");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(buildError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(buildError("Please provide name to update", 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(buildError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return next(buildError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};

const Company = require("../models/User");
const { buildError } = require("../utils/errorBuilder");

const getProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.company._id);

    if (!company) {
      return next(buildError("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        company: company.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, companyName, industry } = req.body;

    if (!name || !companyName) {
      return next(buildError("Please provide name and company name", 400));
    }

    const company = await Company.findByIdAndUpdate(
      req.company._id,
      { name, companyName, industry },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return next(buildError("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        company: company.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.company._id);

    if (!company) {
      return next(buildError("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Company profile deleted successfully",
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

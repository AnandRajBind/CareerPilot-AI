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

const upgradePlan = async (req, res, next) => {
  try {
    const { planName } = req.body;

    // Validate plan name
    const validPlans = ["Starter", "Professional", "Team"];
    if (!planName || !validPlans.includes(planName)) {
      return next(buildError("Invalid plan name", 400));
    }

    // Map plan name to plan ID
    const planIdMap = {
      Starter: "starter",
      Professional: "professional",
      Team: "team",
    };

    const company = await Company.findByIdAndUpdate(
      req.company._id,
      {
        plan: planIdMap[planName],
        planName: planName,
        planUpgradedAt: new Date(),
        isTrialActive: false, // Trial ends when upgrading to paid plan
      },
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
      message: `Successfully upgraded to ${planName} plan`,
      data: {
        company: company.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  upgradePlan,
};

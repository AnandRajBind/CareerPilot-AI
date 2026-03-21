const Interview = require("../models/Interview");
const { buildError } = require("../utils/errorBuilder");

const createInterview = async (req, res, next) => {
  try {
    const { role, mode, questions } = req.validatedBody;

    const interview = new Interview({
      userId: req.user._id,
      role,
      mode,
      questions: questions || [],
    });

    await interview.save();

    res.status(201).json({
      success: true,
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const interviews = await Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id).populate("userId", "name email");

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId._id.toString() !== req.user._id.toString()) {
      return next(buildError("Not authorized to access this interview", 403));
    }

    res.status(200).json({
      success: true,
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, scores, feedback, status } = req.validatedBody;

    const interview = await Interview.findById(id);

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return next(buildError("Not authorized to update this interview", 403));
    }

    if (answers) interview.answers = answers;
    if (scores) interview.scores = { ...interview.scores, ...scores };
    if (feedback) interview.feedback = feedback;
    if (status) interview.status = status;

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);

    if (!interview) {
      return next(buildError("Interview not found", 404));
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return next(buildError("Not authorized to delete this interview", 403));
    }

    await Interview.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
};

const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    jobRole: {
      type: String,
      enum: {
        values: ["frontend", "backend", "fullstack", "java", "hr"],
        message: "Job role must be one of: frontend, backend, fullstack, java, hr",
      },
      required: [true, "Please provide a job role"],
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ["junior", "mid", "senior"],
        message: "Experience level must be one of: junior, mid, senior",
      },
      required: [true, "Please provide experience level"],
    },
    interviewType: {
      type: String,
      enum: {
        values: ["technical", "behavioral", "all"],
        message: "Interview type must be one of: technical, behavioral, all",
      },
      required: [true, "Please specify interview type"],
    },
    difficultyLevel: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty level must be one of: easy, medium, hard",
      },
      required: [true, "Please specify difficulty level"],
    },
    numberOfQuestions: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 question"],
      max: [20, "Cannot exceed 20 questions"],
      default: 5,
    },
    questions: [
      {
        type: String,
        required: true,
      },
    ],
    answers: [
      {
        type: String,
        default: "",
      },
    ],
    evaluation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      strengths: {
        type: String,
        default: "",
      },
      weaknesses: {
        type: String,
        default: "",
      },
      suggestions: {
        type: String,
        default: "",
      },
      modelAnswer: {
        type: String,
        default: "",
      },
      interviewTips: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["in-progress", "completed", "failed"],
        message: "Status must be one of: in-progress, completed, failed",
      },
      default: "in-progress",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ jobRole: 1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model("Interview", interviewSchema);

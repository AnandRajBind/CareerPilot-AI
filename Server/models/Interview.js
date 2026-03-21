const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user ID"],
    },
    role: {
      type: String,
      required: [true, "Please provide a job role"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    mode: {
      type: String,
      enum: {
        values: ["text", "video", "audio"],
        message: "Mode must be one of: text, video, audio",
      },
      required: [true, "Please specify interview mode"],
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    answers: [
      {
        questionId: String,
        answer: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    scores: {
      technical: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      communication: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      overall: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    feedback: {
      type: String,
      maxlength: [5000, "Feedback cannot exceed 5000 characters"],
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

module.exports = mongoose.model("Interview", interviewSchema);

const mongoose = require("mongoose");

const mockInterviewSchema = new mongoose.Schema(
  {
    // Student Information - No authentication required
    studentName: {
      type: String,
      required: [true, "Please provide student name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    rollNumber: {
      type: String,
      required: [true, "Please provide roll number"],
      trim: true,
      lowercase: true,
      index: true, // Index for fast lookup
    },
    collegeName: {
      type: String,
      required: [true, "Please provide college name"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"],
      default: null,
    },

    // Interview Configuration
    jobRole: {
      type: String,
      enum: {
        values: ["frontend", "backend", "fullstack", "java", "python", "hr", "data-science"],
        message: "Job role must be one of: frontend, backend, fullstack, java, python, hr, data-science",
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

    // Interview Content
    questions: [
      {
        type: String,
        required: true,
      },
    ],
    answers: [
      {
        content: {
          type: String,
          default: "",
        },
        format: {
          type: String,
          enum: ["text", "voice"],
          default: "text",
        },
        audioUrl: String, // Store audio blob as URL if voice
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    evaluations: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        score: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
        },
        strengths: String,
        weaknesses: String,
        suggestions: String,
        modelAnswer: String,
        evaluatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Overall Results
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    overallFeedback: {
      strengths: String,
      weaknesses: String,
      suggestions: String,
      interviewTips: String,
    },

    // Status Tracking
    status: {
      type: String,
      enum: {
        values: ["in-progress", "completed", "abandoned"],
        message: "Status must be one of: in-progress, completed, abandoned",
      },
      default: "in-progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    duration: {
      // Duration in seconds
      type: Number,
      default: 0,
    },

    // Metadata
    sessionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true, // For session tracking
    },
    ipAddress: String,
    userAgent: String,
    attemptNumber: {
      type: Number,
      default: 1,
    },

    // Flag to distinguish from real interviews
    type: {
      type: String,
      enum: ["mock"],
      default: "mock",
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index for roll number and date
mockInterviewSchema.index({ rollNumber: 1, createdAt: -1 });

// Compound index for roll number and status
mockInterviewSchema.index({ rollNumber: 1, status: 1 });

// Index for type to speed up isolation queries
mockInterviewSchema.index({ type: 1 });

module.exports = mongoose.model("MockInterview", mockInterviewSchema);

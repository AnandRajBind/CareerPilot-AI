const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Please provide a company ID"],
    },
    jobRole: {
      type: String,
      enum: {
        values: ["frontend", "backend", "fullstack", "java", "python", "hr"],
        message: "Job role must be one of: frontend, backend, fullstack, java, python, hr",
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
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewTemplate",
      default: null,
    },
    isTemplateBasedInterview: {
      type: Boolean,
      default: false,
    },
    candidateEmail: {
      type: String,
      default: null,
    },
    candidateName: {
      type: String,
      default: null,
    },
    // ============ PRODUCTION READINESS FIELDS ============
    // Session Management for Public Interviews
    sessionStatus: {
      type: String,
      enum: {
        values: ["available", "locked", "in_progress", "completed", "expired"],
        message: "Session status must be one of: available, locked, in_progress, completed, expired",
      },
      default: "available",
      index: true,
    },
    // Candidate fingerprint/identifier to lock session
    sessionLockedBy: {
      type: String,
      default: null,
      index: true,
    },
    // Session lock timestamp for timeout tracking
    sessionStartedAt: {
      type: Date,
      default: null,
      index: true,
    },
    // Last activity timestamp for timeout protection
    sessionLastActivity: {
      type: Date,
      default: null,
    },
    // Duplicate submission protection
    submissionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Reference back to template token for session linking
    templateToken: {
      type: String,
      index: true,
      default: null,
    },
    // Session timeout configuration (minutes)
    sessionTimeoutMinutes: {
      type: Number,
      default: 30,
    },
    // Save current question index for resume
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    // Snapshot of answers for resume capability
    answersSnapshot: {
      type: Map,
      of: String,
      default: new Map(),
    },
    // Transcript snapshot for resume capability
    transcriptSnapshot: {
      type: String,
      default: "",
    },
    // ====================================================
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
interviewSchema.index({ companyId: 1, createdAt: -1 });
interviewSchema.index({ jobRole: 1 });
interviewSchema.index({ status: 1 });

// Production readiness indexes
interviewSchema.index({ sessionStatus: 1, sessionStartedAt: 1 }); // For timeout cleanup
interviewSchema.index({ sessionLockedBy: 1, templateToken: 1 }); // For session locking
interviewSchema.index({ templateToken: 1, isTemplateBasedInterview: 1 }); // For public interviews
interviewSchema.index({ sessionLastActivity: 1 }); // For timeout expiration

module.exports = mongoose.model("Interview", interviewSchema);

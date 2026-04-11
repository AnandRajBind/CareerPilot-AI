const mongoose = require("mongoose");
const crypto = require("crypto");

const interviewTemplateSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
      index: true,
    },
    templateName: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    templateDescription: {
      type: String,
      trim: true,
      default: "",
    },
    jobRole: {
      type: String,
      enum: {
        values: ["Frontend", "Backend", "FullStack", "Java", "Python", "HR"],
        message: "Job role must be one of: Frontend, Backend, FullStack, Java, Python, HR",
      },
      required: [true, "Job role is required"],
    },
    interviewType: {
      type: String,
      enum: {
        values: ["Technical", "Behavioral", "Combined"],
        message: "Interview type must be one of: Technical, Behavioral, Combined",
      },
      required: [true, "Interview type is required"],
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ["Junior", "Mid", "Senior"],
        message: "Experience level must be one of: Junior, Mid, Senior",
      },
      required: [true, "Experience level is required"],
    },
    difficultyLevel: {
      type: String,
      enum: {
        values: ["Easy", "Medium", "Hard"],
        message: "Difficulty level must be one of: Easy, Medium, Hard",
      },
      required: [true, "Difficulty level is required"],
    },
    numberOfQuestions: {
      type: Number,
      min: [1, "Minimum 1 question required"],
      max: [20, "Maximum 20 questions allowed"],
      required: [true, "Number of questions is required"],
    },
    uniqueToken: {
      type: String,
      unique: true,
      index: true,
    },
    interviewLink: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
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
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate unique token and link
interviewTemplateSchema.pre("save", async function (next) {
  if (!this.uniqueToken) {
    let token;
    let isUnique = false;

    // Generate unique token
    while (!isUnique) {
      token = crypto.randomBytes(16).toString("hex");
      const existingTemplate = await mongoose.model("InterviewTemplate").findOne({
        uniqueToken: token,
      });
      if (!existingTemplate) {
        isUnique = true;
      }
    }

    this.uniqueToken = token;
    this.interviewLink = `/interview/session/${token}`;
  }

  next();
});

const InterviewTemplate = mongoose.model("InterviewTemplate", interviewTemplateSchema);

module.exports = InterviewTemplate;

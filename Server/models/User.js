const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide contact person name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    companyName: {
      type: String,
      required: [true, "Please provide company name"],
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },
    industry: {
      type: String,
      required: [true, "Please provide industry"],
      enum: {
        values: ["technology", "finance", "healthcare", "retail", "manufacturing", "education", "other"],
        message: "Industry must be one of: technology, finance, healthcare, retail, manufacturing, education, other",
      },
    },
    plan: {
      type: String,
      enum: {
        values: ["free", "starter", "professional", "enterprise"],
        message: "Plan must be one of: free, starter, professional, enterprise",
      },
      default: "free",
    },
    trialStartDate: {
      type: Date,
      default: Date.now,
    },
    trialEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    isTrialActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
companySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
companySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to check if trial is still active
companySchema.methods.isTrialValid = function () {
  return this.isTrialActive && new Date() < this.trialEndDate;
};

// Method to return company without password
companySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes for faster queries
companySchema.index({ email: 1 });
companySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Company", companySchema);

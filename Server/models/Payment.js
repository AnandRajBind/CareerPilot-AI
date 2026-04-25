const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    planId: {
      type: String,
      enum: ["starter", "professional", "enterprise"],
      required: true,
    },
    planName: {
      type: String,
      enum: ["Starter", "Professional", "Enterprise"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "pending", "success", "failed", "cancelled"],
      default: "created",
    },
    description: {
      type: String,
      default: null,
    },
    notes: {
      type: Map,
      of: String,
      default: {},
    },
    errorReason: {
      type: String,
      default: null,
    },
    subscribedUntil: {
      type: Date,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
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

// Indexes for faster queries
paymentSchema.index({ companyId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);

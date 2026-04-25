const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Company = require("../models/User");
const { buildError } = require("../utils/errorBuilder");

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error(
    "ERROR: Razorpay environment variables not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file"
  );
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan pricing configuration
const planPricing = {
  starter: {
    name: "Starter",
    price: 499900, // 4999 INR (in paise)
    description: "Starter plan",
    duration: 30, // days
  },
  professional: {
    name: "Professional",
    price: 1499900, // 14999 INR (in paise)
    description: "Professional plan",
    duration: 30,
  },
  enterprise: {
    name: "Enterprise",
    price: 2999900, // 29999 INR (in paise)
    description: "Enterprise plan",
    duration: 30,
  },
};

// Create Razorpay order
const createOrder = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return next(buildError("Payment gateway is not configured", 500));
    }

    const { planId, amount } = req.body;
    const companyId = req.company._id;
    let resolvedPlanId = planId;
    let planDetails = null;

    // Supports both plan-based and amount-based order creation.
    if (resolvedPlanId && planPricing[resolvedPlanId]) {
      planDetails = planPricing[resolvedPlanId];
    } else if (typeof amount === "number" && amount > 0) {
      resolvedPlanId = "professional";
      planDetails = {
        name: "Custom",
        price: Math.round(amount * 100),
        description: "Custom plan payment",
        duration: 30,
      };
    } else {
      return next(buildError("Invalid plan or amount", 400));
    }

    const companyIdText = companyId.toString();
    // Razorpay receipt must be <= 40 chars.
    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${companyIdText.slice(-8)}`;

    // Create Razorpay order
    const orderOptions = {
      amount: planDetails.price, // Amount in paise
      currency: "INR",
      receipt,
      description: planDetails.description,
      notes: {
        companyId: companyIdText,
        planId: resolvedPlanId,
        planName: planDetails.name,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Save payment record to database
    const payment = await Payment.create({
      companyId,
      razorpayOrderId: razorpayOrder.id,
      planId: resolvedPlanId,
      planName: planDetails.name,
      amount: planDetails.price,
      status: "created",
      description: planDetails.description,
      notes: {
        companyId: companyIdText,
        planId: resolvedPlanId,
        planName: planDetails.name,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", {
      message: error?.message,
      description: error?.error?.description,
      code: error?.error?.code,
      field: error?.error?.field,
      source: error?.error?.source,
      step: error?.error?.step,
      reason: error?.error?.reason,
    });
    next(buildError("Failed to create payment order", 500));
  }
};

// Verify Razorpay payment
const verifyPayment = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return next(buildError("Payment gateway is not configured", 500));
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const companyId = req.company._id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(buildError("Missing payment verification details", 400));
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return next(buildError("Invalid payment signature", 400));
    }

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId,
      companyId,
    });

    if (!payment) {
      return next(buildError("Payment record not found", 404));
    }

    // Idempotency: if this order is already verified, return success.
    if (payment.status === "success") {
      const company = await Company.findById(companyId);

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          payment: {
            id: payment._id,
            status: payment.status,
            planName: payment.planName,
            subscribedUntil: payment.subscribedUntil,
          },
          company: company ? company.toJSON() : null,
        },
      });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "success";
    payment.paymentDate = new Date();
    payment.subscribedUntil = new Date(
      Date.now() + planPricing[payment.planId].duration * 24 * 60 * 60 * 1000
    );

    await payment.save();

    // Update company plan
    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        plan: payment.planId,
        planName: payment.planName,
        isTrialActive: false,
        trialEndDate: new Date(), // Trial ends immediately upon upgrade
        planUpgradedAt: new Date(),
        subscriptionStartDate: new Date(),
        subscriptionEndDate: payment.subscribedUntil,
        isSubscriptionActive: true,
        lastPaymentId: payment._id,
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
      message: "Payment verified successfully",
      data: {
        payment: {
          id: payment._id,
          status: payment.status,
          planName: payment.planName,
          subscribedUntil: payment.subscribedUntil,
        },
        company: company.toJSON(),
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    next(buildError("Failed to verify payment", 500));
  }
};

// Get payment history
const getPaymentHistory = async (req, res, next) => {
  try {
    const companyId = req.company._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find({ companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPayments = await Payment.countDocuments({ companyId });

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          totalPayments,
          totalPages: Math.ceil(totalPayments / limitNum),
          currentPage: pageNum,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    next(buildError("Failed to fetch payment history", 500));
  }
};

// Get single payment details
const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const companyId = req.company._id;

    const payment = await Payment.findOne({
      _id: paymentId,
      companyId,
    });

    if (!payment) {
      return next(buildError("Payment not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
      },
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    next(buildError("Failed to fetch payment details", 500));
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
};

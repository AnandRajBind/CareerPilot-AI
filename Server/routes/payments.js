const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Create payment order
router.post("/create-order", paymentController.createOrder);

// Verify payment
router.post("/verify", paymentController.verifyPayment);

// Get payment history
router.get("/history", paymentController.getPaymentHistory);

// Get payment details
router.get("/:paymentId", paymentController.getPaymentDetails);

module.exports = router;

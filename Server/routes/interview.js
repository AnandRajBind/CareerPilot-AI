const express = require("express");
const interviewController = require("../controllers/interviewController");
const { validate, schemas } = require("../utils/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Protect all routes - require authentication
router.use(protect);

/**
 * AI Interview Flow Routes
 */

// Start a new interview with AI-generated questions
router.post(
  "/start",
  validate(schemas.startInterview),
  interviewController.startInterview
);

// Generate questions standalone (for preview or testing)
router.post(
  "/generate-questions",
  validate(schemas.generateQuestions),
  interviewController.generateQuestionsOnly
);

// Evaluate a single answer during interview
router.post(
  "/:id/evaluate-answer",
  validate(schemas.submitAnswer),
  interviewController.evaluateAnswerSubmission
);

// Complete interview and get final evaluation
router.post(
  "/:id/complete",
  validate(schemas.completeInterview),
  interviewController.completeInterview
);

// Get interview results/evaluation
router.get("/:id/result", interviewController.getInterviewResult);

/**
 * Standard Interview Management Routes
 */

// Get all interviews (with filtering and pagination)
router.get("/", interviewController.getInterviews);

// Get single interview by ID
router.get("/:id", interviewController.getInterviewById);

// Delete interview
router.delete("/:id", interviewController.deleteInterview);

module.exports = router;

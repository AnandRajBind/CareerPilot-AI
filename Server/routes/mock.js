const express = require("express");
const mockController = require("../controllers/mockController");
const { validate, schemas } = require("../utils/validation");

const router = express.Router();

/**
 * Mock Interview Routes
 * IMPORTANT: No authentication required - students can access without login
 * All routes use roll number as primary identifier
 */

/**
 * POST /api/mock/start
 * Start a new mock interview
 * Body: {studentName, rollNumber, collegeName, email?, jobRole, experienceLevel, interviewType, difficultyLevel, numberOfQuestions}
 */
router.post("/start", validate(schemas.startMockInterview), mockController.startMockInterview);

/**
 * POST /api/mock/answer
 * Submit an answer for a specific question
 * Body: {interviewId, questionIndex, answer, format}
 */
router.post("/answer", validate(schemas.submitMockAnswer), mockController.submitAnswer);

/**
 * POST /api/mock/complete/:interviewId
 * Complete the interview and calculate final score
 */
router.post("/complete/:interviewId", mockController.completeMockInterview);

/**
 * GET /api/mock/result/:interviewId
 * Get results for a specific mock interview
 */
router.get("/result/:interviewId", mockController.getMockInterviewResult);

/**
 * GET /api/mock/history/:rollNumber
 * Get interview history for a student (by roll number)
 * Query params: limit=10, skip=0
 */
router.get("/history/:rollNumber", mockController.getMockInterviewHistory);

/**
 * GET /api/mock/stats/:rollNumber
 * Get statistics for a student (average score, best score, improvement, etc.)
 */
router.get("/stats/:rollNumber", mockController.getMockInterviewStats);

module.exports = router;

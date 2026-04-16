const express = require("express");
const templateController = require("../controllers/templateController");
const { validate, schemas } = require("../utils/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * Public Candidate Routes - No Authentication Required
 * These must come BEFORE the protect middleware is applied
 * 
 * PRODUCTION FEATURES:
 * - Session locking for concurrent user prevention
 * - Resume capability for refresh recovery
 * - Timeout protection
 * - Duplicate submission protection
 * - Secure public submission
 */

// Get template info by token (public)
router.get("/session/:token/info", templateController.getTemplateInfoByToken);

// Start interview using template token (public - no auth)
// Returns sessionLockId for frontend to use in subsequent requests
router.post("/session/:token/start", templateController.startInterviewFromTemplate);

// Resume interview session (after refresh/browser close) - NEW
// Validates sessionLockId for security
router.get("/session/:interviewId/resume", templateController.resumeInterviewSession);

// Update interview progress (save current state) - NEW
// Allows resume capability without completing interview
router.put("/session/:interviewId/progress", templateController.updateInterviewProgress);

// Submit completed interview (public - no auth)
// Validates sessionLockId, prevents duplicates, auto-evaluates
// NEW: Changed from /evaluate to /:interviewId/submit
router.post("/session/:interviewId/submit", templateController.evaluateTemplateInterview);

// Keep /evaluate endpoint for backward compatibility
router.post("/evaluate", templateController.evaluateTemplateInterview);

/**
 * Company Admin Routes - Require Authentication
 * Apply auth middleware to all subsequent routes
 */

router.use(protect);

// Create new interview template
router.post(
  "/template",
  validate(schemas.createTemplate),
  templateController.createTemplate
);

// Get all templates for company
router.get("/templates", templateController.getCompanyTemplates);

// Get specific template
router.get("/template/:templateId", templateController.getTemplateById);

// Update template
router.put(
  "/template/:templateId",
  validate(schemas.updateTemplate),
  templateController.updateTemplate
);

// Delete template
router.delete("/template/:templateId", templateController.deleteTemplate);

module.exports = router;


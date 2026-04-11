const express = require("express");
const templateController = require("../controllers/templateController");
const { validate, schemas } = require("../utils/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * Company Admin Routes - Require Authentication
 */

// Apply auth middleware to all routes
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

/**
 * Candidate Routes - No Authentication Required
 */

// Get template info by token (public)
router.get("/session/:token/info", templateController.getTemplateInfoByToken);

// Start interview using template token (public - no auth)
router.post("/session/:token/start", templateController.startInterviewFromTemplate);

module.exports = router;

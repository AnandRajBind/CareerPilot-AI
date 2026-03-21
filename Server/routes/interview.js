const express = require("express");
const interviewController = require("../controllers/interviewController");
const { validate, schemas } = require("../utils/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  validate(schemas.createInterview),
  interviewController.createInterview
);
router.get("/", interviewController.getInterviews);
router.get("/:id", interviewController.getInterviewById);
router.put(
  "/:id",
  validate(schemas.updateInterview),
  interviewController.updateInterview
);
router.delete("/:id", interviewController.deleteInterview);

module.exports = router;

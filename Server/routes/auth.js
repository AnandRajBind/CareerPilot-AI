const express = require("express");
const authController = require("../controllers/authController");
const { validate, schemas } = require("../utils/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", validate(schemas.register), authController.register);
router.post("/login", validate(schemas.login), authController.login);
router.post("/logout", protect, authController.logout);

module.exports = router;

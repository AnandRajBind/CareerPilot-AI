const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.delete("/profile", userController.deleteProfile);
router.post("/upgrade-plan", userController.upgradePlan);

module.exports = router;

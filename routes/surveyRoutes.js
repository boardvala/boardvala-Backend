const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { submitSurvey, getSurveyStats } = require("../controllers/surveyController");

router.post("/", submitSurvey);
router.get("/stats", authMiddleware, adminMiddleware, getSurveyStats);

module.exports = router;
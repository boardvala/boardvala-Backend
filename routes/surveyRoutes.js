const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { submitSurvey, getSurveyStats } = require("../controllers/surveyController");

router.post("/", submitSurvey);
router.get("/stats", authMiddleware, adminMiddleware, getSurveyStats);

module.exports = router;
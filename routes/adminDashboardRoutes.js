const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getDashboardStats } = require("../controllers/dashboardController");

router.get("/dashboard-stats", authMiddleware, getDashboardStats);

module.exports = router;
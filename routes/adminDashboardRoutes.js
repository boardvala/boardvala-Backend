const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { getDashboardStats, getRegisteredUsers, } = require("../controllers/dashboardController");

router.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats);

router.get("/Registered-users", authMiddleware, adminMiddleware, getRegisteredUsers);

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createFeaturedOrder,
  getAllFeaturedOrders,
  getFeaturedOrderById,
  updateFeaturedOrderStatus,
  getMyFeaturedOrders,        // ← नवीन
  getMyFeaturedOrderById,
} = require("../controllers/Featuredordercontroller");

// user चे स्वतःचे orders (login हवं)
router.get("/my/orders", authMiddleware, getMyFeaturedOrders);
router.get("/my/orders/:id", authMiddleware, getMyFeaturedOrderById);

//admmin
router.post("/", authMiddleware, createFeaturedOrder);        // logged-in user
router.get("/", authMiddleware, adminMiddleware, getAllFeaturedOrders);
router.get("/:id", authMiddleware, adminMiddleware, getFeaturedOrderById);
router.put("/:id/status", authMiddleware, adminMiddleware, updateFeaturedOrderStatus);

module.exports = router;
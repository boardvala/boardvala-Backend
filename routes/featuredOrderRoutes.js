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
  //getFeaturedOrderTracking ,
  //getAdminFeaturedOrderTracking ,
} = require("../controllers/Featuredordercontroller");

// user चे स्वतःचे orders (login हवं)
router.get("/my/orders", authMiddleware, getMyFeaturedOrders);
router.get("/my/orders/:id", authMiddleware, getMyFeaturedOrderById);


router.post("/", authMiddleware, createFeaturedOrder);        // logged-in user
//router.get("/:id/tracking", authMiddleware, getFeaturedOrderTracking);
//admmin
router.get("/", authMiddleware, adminMiddleware, getAllFeaturedOrders);
//router.get("/:id/admin-tracking", authMiddleware, adminMiddleware, getAdminFeaturedOrderTracking);
router.get("/:id", authMiddleware, adminMiddleware, getFeaturedOrderById);
router.put("/:id/status", authMiddleware, adminMiddleware, updateFeaturedOrderStatus);

module.exports = router;
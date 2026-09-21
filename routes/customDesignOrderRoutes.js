const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createCustomDesignOrder,
  getAllCustomDesignOrders,
  getCustomDesignOrderById,
  updateCustomDesignStatus,
  getMyCustomDesignOrders,
  getMyCustomDesignOrderById,
  updateOrderShipping,
  trackOrderShipment ,
  //getOrderTracking,
  //getAdminOrderTracking,
} = require("../controllers/customDesignOrderController");

//for user's
router.post(
  "/",
  authMiddleware,
  createCustomDesignOrder
);

//for admin
router.get("/", authMiddleware, adminMiddleware, getAllCustomDesignOrders);

//for user's
router.get(
  "/my-orders",
  authMiddleware,
  getMyCustomDesignOrders
);

//for user's
router.get(
  "/my-orders/:id",
  authMiddleware,
  getMyCustomDesignOrderById
);

// router.get("/:id/tracking", authMiddleware, getOrderTracking);
// //for admin
// router.get("/:id/admin-tracking", authMiddleware, adminMiddleware, getAdminOrderTracking);

// Admin — shipping update
router.put("/:id/shipping", authMiddleware, adminMiddleware, updateOrderShipping);

// Admin + User — track shipment (Envia API)
router.get("/:id/track", authMiddleware, trackOrderShipment);

router.get("/:id", authMiddleware, adminMiddleware, getCustomDesignOrderById);

router.put("/:id", authMiddleware, adminMiddleware, updateCustomDesignStatus);

module.exports = router;
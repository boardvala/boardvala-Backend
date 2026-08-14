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
  getOrderTracking,
  getAdminOrderTracking,
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

router.get("/:id/tracking", authMiddleware, getOrderTracking);
//for admin
router.get("/:id/admin-tracking", authMiddleware, adminMiddleware, getAdminOrderTracking);

router.get("/:id", authMiddleware, adminMiddleware, getCustomDesignOrderById);

router.put("/:id", authMiddleware, adminMiddleware, updateCustomDesignStatus);

module.exports = router;
const express = require("express");
const router = express.Router();
const upload = require("../middleware/customDesignUpload");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createCustomDesignOrder,
  getAllCustomDesignOrders,
  getCustomDesignOrderById,
  updateCustomDesignStatus,
  getMyCustomDesignOrders,
  getMyCustomDesignOrderById,
} = require("../controllers/customDesignOrderController");

router.post(
  "/",
  authMiddleware,
  createCustomDesignOrder
);

router.get("/", authMiddleware, getAllCustomDesignOrders);

router.get(
  "/my-orders",
  authMiddleware,
  getMyCustomDesignOrders
);

router.get(
  "/my-orders/:id",
  authMiddleware,
  getMyCustomDesignOrderById
);

router.get("/:id", authMiddleware, getCustomDesignOrderById);

router.put("/:id", authMiddleware, updateCustomDesignStatus);

module.exports = router;
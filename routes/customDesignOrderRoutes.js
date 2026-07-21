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
  upload.single("designFile"),
  createCustomDesignOrder
);

router.get("/", getAllCustomDesignOrders);

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

router.get("/:id", getCustomDesignOrderById);

router.put("/:id", updateCustomDesignStatus);

module.exports = router;
const express = require("express");
const router = express.Router();
const upload = require("../middleware/customDesignUpload");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createCustomDesignOrder,
  getAllCustomDesignOrders,
  getCustomDesignOrderById,
  updateCustomDesignStatus,
} = require("../controllers/customDesignOrderController");

router.post(
  "/",
  authMiddleware,
  upload.single("designFile"),
  createCustomDesignOrder
);

router.get("/", getAllCustomDesignOrders);

router.get("/:id", getCustomDesignOrderById);

router.put("/:id", updateCustomDesignStatus);

module.exports = router;
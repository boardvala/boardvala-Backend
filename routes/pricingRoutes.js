const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createPricing,
  getPricing,
  getPricingByMaterial,
  updatePricing,

  createMaterial,
  deleteMaterial,
  addFrameSize,
  deleteFrameSize,
  updateFrameSize,
} = require("../controllers/pricingController");

// Material
router.post("/material", authMiddleware, createMaterial);

router.delete("/material/:material", authMiddleware, deleteMaterial);

// Frame Size
router.post("/:material/frame", authMiddleware, addFrameSize);

router.delete("/:material/frame/:frameSize", authMiddleware, deleteFrameSize);

router.put("/:material/frame/:frameSize", authMiddleware, updateFrameSize);

// Existing
router.post("/", authMiddleware, createPricing);

router.get("/", authMiddleware, getPricing);

router.get("/:material", authMiddleware, getPricingByMaterial);

router.put("/:material", authMiddleware, updatePricing);

module.exports = router;

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
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
router.post("/material", authMiddleware, adminMiddleware, createMaterial);

router.delete("/material/:material", authMiddleware, adminMiddleware, deleteMaterial);

// Frame Size
router.post("/:material/frame", authMiddleware, adminMiddleware, addFrameSize);

router.delete("/:material/frame/:frameSize", authMiddleware, adminMiddleware, deleteFrameSize);

router.put("/:material/frame/:frameSize", authMiddleware, adminMiddleware, updateFrameSize);

// Existing
router.post("/", authMiddleware, adminMiddleware, createPricing);

router.get("/",  getPricing);

router.get("/:material",  getPricingByMaterial);

router.put("/:material",  authMiddleware, adminMiddleware, updatePricing);

module.exports = router;

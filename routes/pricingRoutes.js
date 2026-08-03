const express = require("express");

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
router.post("/material", createMaterial);

router.delete("/material/:material", deleteMaterial);

// Frame Size
router.post("/:material/frame", addFrameSize);

router.delete("/:material/frame/:frameSize", deleteFrameSize);

router.put("/:material/frame/:frameSize", updateFrameSize);

// Existing
router.post("/", createPricing);

router.get("/", getPricing);

router.get("/:material", getPricingByMaterial);

router.put("/:material", updatePricing);

module.exports = router;

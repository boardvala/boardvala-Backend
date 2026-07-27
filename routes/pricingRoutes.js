const express = require("express");

const router = express.Router();

const {
  createPricing,
  getPricing,
  getPricingByMaterial,
  updatePricing,
} = require("../controllers/pricingController");

router.post("/", createPricing);

router.get("/", getPricing);

router.get("/:material", getPricingByMaterial);

router.put("/:material", updatePricing);

module.exports = router;
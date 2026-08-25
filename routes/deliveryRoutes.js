const express = require("express");
const router = express.Router();
const { checkDelivery } = require("../controllers/deliveryController");

// Public — auth नको (कोणीही pincode check करू शकतो)
router.get("/check", checkDelivery);

module.exports = router;
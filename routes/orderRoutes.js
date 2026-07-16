const express = require("express");

const router = express.Router();

const {createOrder, getOrders, getOrder } = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getOrders);

router.get("/:id", authMiddleware, getOrder);

router.post("/", authMiddleware, createOrder);

module.exports = router;
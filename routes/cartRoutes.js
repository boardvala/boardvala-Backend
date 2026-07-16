const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addToCart,

  getCart,

  updateQuantity,

  removeCartItem,

  syncGuestCart,
} = require("../controllers/cartController");

router.post("/", authMiddleware, addToCart);

router.post("/sync", authMiddleware, syncGuestCart);

router.get("/", authMiddleware, getCart);

router.put("/:id", authMiddleware, updateQuantity);

router.delete("/:id", authMiddleware, removeCartItem);


module.exports = router;

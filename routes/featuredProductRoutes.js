const express = require("express");
const router = express.Router();
const upload = require("../middleware/galleryUpload");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createFeaturedProduct,
  getFeaturedProducts,
  getFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct,
  addFeaturedProductImages,
  deleteFeaturedProductImage,
} = require("../controllers/FeaturedProductController");

// create — आधी auth+admin तपासा, मग (admin असेल तरच) files घे
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  createFeaturedProduct,
);

// public — user बघू शकतो
router.get("/", getFeaturedProducts);

router.get("/:id", getFeaturedProduct);

// update — टप्पा १: फक्त details + price (images नाही, म्हणून upload नको)
router.put("/:id", authMiddleware, adminMiddleware, updateFeaturedProduct);

// Add new images (max 5 total)
router.post(
  "/:id/images",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  addFeaturedProductImages,
);

// Delete single image
router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  adminMiddleware,
  deleteFeaturedProductImage,
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteFeaturedProduct);

module.exports = router;
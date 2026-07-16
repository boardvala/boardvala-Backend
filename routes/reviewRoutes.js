const express = require("express");

const router = express.Router();

const {
  createReview,
  getGalleryReviews,
  getProductReviews,
  deleteReview,
} = require("../controllers/reviewController");

// Create Review
router.post("/", createReview);

// Get Reviews
router.get("/gallery/:id", getGalleryReviews);
router.get("/product/:id", getProductReviews);

// Delete Review (Admin)
router.delete("/:id", deleteReview);

module.exports = router;
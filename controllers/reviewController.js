const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create({
      product: req.body.product || null,
      galleryDesign: req.body.galleryDesign || null,
      featuredProduct: req.body.featuredProduct || null,

      name: req.body.name,
      email: req.body.email,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json(review);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getGalleryReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      galleryDesign: req.params.id,
      approved: true,
    }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.id,
      approved: true,
    }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// नवीन — featured product चे reviews
exports.getFeaturedProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      featuredProduct: req.params.id,
      approved: true,
    }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    res.json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const express = require("express");
const router = express.Router();
const upload = require("../middleware/galleryUpload");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createGalleryDesign,
  getGalleryDesigns,
  getGalleryDesign,
  updateGalleryDesign ,
  deleteGalleryDesign,
  getSimilarGalleryDesigns,
  addGalleryDesignImages,
  deleteGalleryDesignImage,
} = require("../controllers/galleryDesignController");

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  createGalleryDesign
);

router.get("/", getGalleryDesigns);

router.get("/:id", getGalleryDesign);

router.put("/:id", authMiddleware, adminMiddleware, updateGalleryDesign);

// Add images to existing gallery design
router.post(
  "/:id/images",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  addGalleryDesignImages
);

// Delete single image from gallery design
router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  adminMiddleware,
  deleteGalleryDesignImage
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteGalleryDesign);

router.get("/:id/similar", getSimilarGalleryDesigns);

module.exports = router;
const express = require("express");

const router = express.Router();

const upload = require("../middleware/galleryUpload");

const {
  createGalleryDesign,
  getGalleryDesigns,
  getGalleryDesign,
  deleteGalleryDesign,
  getSimilarGalleryDesigns,
} = require("../controllers/galleryDesignController");

router.post(
  "/",
  upload.array("images", 5),
  createGalleryDesign
);

router.get("/", getGalleryDesigns);

router.get("/:id", getGalleryDesign);

router.delete("/:id", deleteGalleryDesign);

router.get("/:id/similar", getSimilarGalleryDesigns);

module.exports = router;
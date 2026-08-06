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

router.delete("/:id", authMiddleware, adminMiddleware, deleteGalleryDesign);

router.get("/:id/similar", getSimilarGalleryDesigns);

module.exports = router;
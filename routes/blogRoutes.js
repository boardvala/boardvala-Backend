const express = require("express");
const router = express.Router();
const upload = require("../middleware/galleryUpload");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
} = require("../controllers/blogController");

// Public routes
router.get("/published", getPublishedBlogs);
router.get("/slug/:slug", getBlogBySlug);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllBlogs);
router.get("/:id", authMiddleware, adminMiddleware, getBlogById);
router.post("/", authMiddleware, adminMiddleware, upload.single("coverImage"), createBlog);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("coverImage"), updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);
router.patch("/:id/toggle-publish", authMiddleware, adminMiddleware, togglePublish);

module.exports = router;
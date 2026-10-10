const express = require("express");
const router = express.Router();
const upload = require("../middleware/galleryUpload"); // तोच multer middleware (10MB, image only)
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createProject,
  getAllProjects,
  getProject,
  getFeaturedProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// Public routes
router.get("/featured", getFeaturedProjects);  // home page साठी
router.get("/:id", getProject);                // details page

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllProjects);
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 10), createProject);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 10), updateProject);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProject);

module.exports = router;
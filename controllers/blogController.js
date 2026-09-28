const Blog = require("../models/Blog");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

// Public — published blogs only
exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .select("-content");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public — single blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — all blogs (published + draft)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select("-content");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — create
exports.createBlog = async (req, res) => {
  try {
    let slug = req.body.slug || req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await Blog.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const wordCount = (req.body.content || "").split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Cover image upload (single file)
    let coverImage = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file, "boardvala/blog");
      coverImage = result.secure_url;
    }

    const blog = await Blog.create({
      ...req.body,
      slug,
      readTime,
      coverImage,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — update
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.body.content) {
      const wordCount = req.body.content.split(/\s+/).length;
      req.body.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // New cover image upload → old delete
    if (req.file) {
      // Delete old image from Cloudinary
      if (blog.coverImage) {
        try {
          const parts = blog.coverImage.split("/");
          const publicId = "boardvala/blog/" + parts[parts.length - 1].split(".")[0];
          await deleteFromCloudinary(publicId);
        } catch (delErr) {
          console.log("Old cover delete failed:", delErr.message);
        }
      }

      const result = await uploadToCloudinary(req.file, "boardvala/blog");
      req.body.coverImage = result.secure_url;
    }

    // Parse tags if string
    if (req.body.tags && typeof req.body.tags === "string") {
      req.body.tags = JSON.parse(req.body.tags);
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — delete
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — toggle publish
exports.togglePublish = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    blog.published = !blog.published;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
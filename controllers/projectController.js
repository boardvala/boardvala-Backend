const Project = require("../models/Project");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

// Slug generate from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Unique slug — duplicate title handle
async function getUniqueSlug(title, excludeId = null) {
  let slug = generateSlug(title);
  let count = 0;
  let candidate = slug;
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Project.findOne(query);
    if (!exists) return candidate;
    count++;
    candidate = `${slug}-${count}`;
  }
}

// Admin — नवीन project बनवा
exports.createProject = async (req, res) => {
  try {
    const images = await Promise.all(
      (req.files || []).map(async (file) => {
        const result = await uploadToCloudinary(file, "boardvala/projects");
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );

    const project = await Project.create({
      title: req.body.title,
      slug: await getUniqueSlug(req.body.title),
      description: req.body.description || "",
      category: req.body.category,
      location: req.body.location || "",
      featured: req.body.featured === "true" || req.body.featured === true,
      active: req.body.active === "true" || req.body.active === true,
      images,
      coverImage: images.length > 0 ? images[0] : undefined,
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin — सगळे projects (active + inactive)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public — एक project (details page) — ID आणि slug दोन्ही support
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    let project;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }
    if (!project) {
      project = await Project.findOne({ slug: id });
    }
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public — featured + active projects (home page section)
exports.getFeaturedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ featured: true, active: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin — project update
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (req.body.title !== undefined) {
      project.title = req.body.title;
      project.slug = await getUniqueSlug(req.body.title, project._id);
    }
    if (req.body.description !== undefined) project.description = req.body.description;
    if (req.body.category !== undefined) project.category = req.body.category;
    if (req.body.location !== undefined) project.location = req.body.location;
    if (req.body.featured !== undefined) {
      project.featured = req.body.featured === "true" || req.body.featured === true;
    }
    if (req.body.active !== undefined) {
      project.active = req.body.active === "true" || req.body.active === true;
    }

    // ── Remove selected images from Cloudinary ──
    if (req.body.removeImages) {
      const toRemove = JSON.parse(req.body.removeImages);
      for (const imgId of toRemove) {
        try {
          await deleteFromCloudinary(imgId);
        } catch (e) {
          console.log("Cloudinary delete error:", e.message);
        }
      }
      project.images = project.images.filter((img) => {
        const id = img.publicId || img;
        return !toRemove.includes(id);
      });

      if (project.coverImage && toRemove.includes(project.coverImage.publicId)) {
        project.coverImage = project.images.length > 0 ? project.images[0] : null;
      }
    }

    // ── Add new images to Cloudinary ──
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, "boardvala/projects");
        project.images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      if (!project.coverImage && project.images.length > 0) {
        project.coverImage = project.images[0];
      }
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin — project delete
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    for (const img of project.images) {
      if (img.publicId) {
        try {
          await deleteFromCloudinary(img.publicId);
        } catch (e) {
          console.error("Image delete failed:", e.message);
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
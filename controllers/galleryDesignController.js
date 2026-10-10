const GalleryDesign = require("../models/GalleryDesign");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(title, excludeId = null) {
  let slug = generateSlug(title);
  let count = 0;
  let candidate = slug;
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await GalleryDesign.findOne(query);
    if (!exists) return candidate;
    count++;
    candidate = `${slug}-${count}`;
  }
}

exports.createGalleryDesign = async (req, res) => {
  try {
    // Upload all images to Cloudinary
    const images = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadToCloudinary(file, "boardvala/gallery");

        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );

    const design = await GalleryDesign.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      featured: req.body.featured === "true",
      active: req.body.active === "true",
      images,
      slug: await getUniqueSlug(req.body.title),
    });

    res.status(201).json(design);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getGalleryDesigns = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const designs = await GalleryDesign.find(filter).sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGalleryDesign = async (req, res) => {
  try {
    const { id } = req.params;
    // Try slug first, then ObjectId
    let design;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      design = await GalleryDesign.findById(id);
    }
    if (!design) {
      design = await GalleryDesign.findOne({ slug: id });
    }
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }
    res.json(design);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGalleryDesign = async (req, res) => {
  try {
    const design = await GalleryDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        message: "Design not found",
      });
    }

    // Delete all images from Cloudinary
    for (const image of design.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId, "image");
      }
    }

    await design.deleteOne();

    res.json({
      message: "Design deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getSimilarGalleryDesigns = async (req, res) => {
  try {
    // Find current design
    const { id } = req.params;
    let currentDesign;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      currentDesign = await GalleryDesign.findById(id);
    }
    if (!currentDesign) {
      currentDesign = await GalleryDesign.findOne({ slug: id });
    }

    if (!currentDesign) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Find similar designs from same category
    const similarDesigns = await GalleryDesign.find({
      category: currentDesign.category,
      _id: { $ne: currentDesign._id },
      active: true,
    })
      .sort({ createdAt: -1 })
      .limit(4);

    // Normalize response
    const designs = similarDesigns.map((design) => ({
      id: design._id,
      type: "gallery",
      name: design.title,
      slug: design.slug,
      previewImage: design.images[0],
      category: design.category,
    }));

    res.json(designs);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// टप्पा १: फक्त details बदलतो — images ला हात लावत नाही (त्या तशाच राहतात).

exports.updateGalleryDesign = async (req, res) => {
  try {
    const design = await GalleryDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        message: "Design not found",
      });
    }

    // फक्त details बदला (जे पाठवलं तेच; नाहीतर जुनं ठेवा)
         if (req.body.title !== undefined) {
      design.title = req.body.title;
      design.slug = await getUniqueSlug(req.body.title, design._id);
    }
    if (req.body.description !== undefined)
      design.description = req.body.description;
    if (req.body.category !== undefined) design.category = req.body.category;

    // checkbox — string "true"/"false" किंवा boolean दोन्ही सांभाळतो
    if (req.body.featured !== undefined) {
      design.featured =
        req.body.featured === "true" || req.body.featured === true;
    }
    if (req.body.active !== undefined) {
      design.active = req.body.active === "true" || req.body.active === true;
    }

    // images ला हात लावत नाही — जुन्या तशाच राहतात.

    await design.save();

    res.json(design);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.addGalleryDesignImages = async (req, res) => {
  try {
    const design = await GalleryDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        message: "Design not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image.",
      });
    }

    // Maximum 5 images allowed
    if (design.images.length + req.files.length > 5) {
      return res.status(400).json({
        message: "Maximum 5 images are allowed.",
      });
    }

    const newImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadToCloudinary(file, "boardvala/gallery");

        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );

    design.images.push(...newImages);

    await design.save();

    res.json({
      message: "Images added successfully.",
      images: design.images,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteGalleryDesignImage = async (req, res) => {
  try {
    const design = await GalleryDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        message: "Design not found",
      });
    }

    const image = design.images.id(req.params.imageId);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId, "image");
    }

    image.deleteOne();

    await design.save();

    res.json({
      message: "Image deleted successfully.",
      images: design.images,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
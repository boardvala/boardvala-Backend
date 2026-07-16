const GalleryDesign = require("../models/GalleryDesign");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

exports.createGalleryDesign = async (req, res) => {
  try {
    // Upload all images to Cloudinary
    const images = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadToCloudinary(
          file,
          "boardvala/gallery"
        );

        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      })
    );

    const design = await GalleryDesign.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      featured: req.body.featured === "true",
      active: req.body.active === "true",
      images,
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
    const design = await GalleryDesign.findById(req.params.id);
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
    const currentDesign = await GalleryDesign.findById(req.params.id);
   
    if (!currentDesign) {
      return res.status(404).json({
        message: "Design not found",
      });
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
      price: design.price,
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

const Product = require("../models/Product");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    // Upload Preview Image
    const previewResult = await uploadToCloudinary(
      req.files.previewImage[0],
      "boardvala/products/previews"
    );

    // Upload SVG Template
    const svgResult = await uploadToCloudinary(
      req.files.svgTemplate[0],
      "boardvala/products/templates"
    );

    const product = await Product.create({
      name: req.body.name,

      description: req.body.description,

      price: req.body.price,

      category: req.body.category,

      width: req.body.width,

      height: req.body.height,

      productionType: req.body.productionType || "both",

      previewImage: {
        url: previewResult.secure_url,
        publicId: previewResult.public_id,
      },

      svgTemplate: {
        url: svgResult.secure_url,
        publicId: svgResult.public_id,
      },

      editableFields: req.body.editableFields
        ? JSON.parse(req.body.editableFields)
        : [],
    });

    res.status(201).json(product);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// GET SINGLE PRODUCT
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.name = req.body.name;
    product.description = req.body.description;
    product.price = req.body.price;
    product.category = req.body.category;
    product.width = req.body.width;
    product.height = req.body.height;
    product.productionType = req.body.productionType;

    product.editableFields = req.body.editableFields
      ? JSON.parse(req.body.editableFields)
      : [];

    // Update Preview Image
    if (req.files && req.files.previewImage) {
      await deleteFromCloudinary(product.previewImage.publicId, "image");

      const previewResult = await uploadToCloudinary(
        req.files.previewImage[0],
        "boardvala/products/previews"
      );

      product.previewImage = {
        url: previewResult.secure_url,
        publicId: previewResult.public_id,
      };
    }

    // Update SVG Template
    if (req.files && req.files.svgTemplate) {
      await deleteFromCloudinary(product.svgTemplate.publicId, "raw");

      const svgResult = await uploadToCloudinary(
        req.files.svgTemplate[0],
        "boardvala/products/templates"
      );

      product.svgTemplate = {
        url: svgResult.secure_url,
        publicId: svgResult.public_id,
      };
    }

    await product.save();

    res.json(product);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete Preview Image
    if (product.previewImage?.publicId) {
      await deleteFromCloudinary(
        product.previewImage.publicId,
        "image"
      );
    }

    // Delete SVG Template
    if (product.svgTemplate?.publicId) {
      await deleteFromCloudinary(
        product.svgTemplate.publicId,
        "raw"
      );
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
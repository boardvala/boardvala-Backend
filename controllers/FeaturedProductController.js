const FeaturedProduct = require("../models/FeaturedProduct");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

// ---- Create ----
exports.createFeaturedProduct = async (req, res) => {
  try {
    // सगळ्या images Cloudinary वर (gallery सारखं)
    const images = await Promise.all(
      (req.files || []).map(async (file) => {
        const result = await uploadToCloudinary(
          file,
          "boardvala/featured-products",
        );
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );

    const product = await FeaturedProduct.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price, // admin कडून, साठवला जातो
      category: req.body.category,
      inStock: req.body.inStock === "true" || req.body.inStock === true,
      active: req.body.active === "true" || req.body.active === true,
      images,
    });

    res.status(201).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ---- List (सगळे; user साठी active filter जोडता येईल) ----
exports.getFeaturedProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    // public list ला फक्त active हवे असतील तर: filter.active = true;
    if (req.query.activeOnly === "true") filter.active = true;

    const products = await FeaturedProduct.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Get one ----
exports.getFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Update (टप्पा १: details + price; images ला हात नाही) ----
exports.updateFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.body.title !== undefined) product.title = req.body.title;
    if (req.body.description !== undefined)
      product.description = req.body.description;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.category !== undefined) product.category = req.body.category;

    if (req.body.inStock !== undefined) {
      product.inStock =
        req.body.inStock === "true" || req.body.inStock === true;
    }
    if (req.body.active !== undefined) {
      product.active = req.body.active === "true" || req.body.active === true;
    }

    // images ला हात लावत नाही — तशाच राहतात.

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ---- Delete (images Cloudinary वरून पण काढा) ----
exports.deleteFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    for (const image of product.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId, "image");
      }
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
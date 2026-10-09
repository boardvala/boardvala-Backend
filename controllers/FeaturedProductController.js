const mongoose = require("mongoose");
const FeaturedProduct = require("../models/FeaturedProduct");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/cloudinaryDelete");

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
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
    const exists = await FeaturedProduct.findOne(query);
    if (!exists) return candidate;
    count++;
    candidate = `${slug}-${count}`;
  }
}

// ---- Create ----
exports.createFeaturedProduct = async (req, res) => {
  try {
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

    // sizes parse (JSON string → array)
    let sizes = [];
    if (req.body.sizes) {
      try {
        sizes = JSON.parse(req.body.sizes);
      } catch {
        sizes = [];
      }
    }

    const slug = await getUniqueSlug(req.body.title);

    const product = await FeaturedProduct.create({
      title: req.body.title,
      slug,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      material: req.body.material || "",
      size: req.body.size || "",
      thickness: req.body.thickness || "",
      waterproof:
        req.body.waterproof === "true" || req.body.waterproof === true,
      inStock: req.body.inStock === "true" || req.body.inStock === true,
      active: req.body.active === "true" || req.body.active === true,
      isCustomizable: req.body.isCustomizable === "true",
      sizes,
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
    const param = req.params.id;
    let product;

    if (mongoose.Types.ObjectId.isValid(param) && param.length === 24) {
      product = await FeaturedProduct.findById(param);
    }

    if (!product) {
      product = await FeaturedProduct.findOne({ slug: param });
    }

    if (!product) return res.status(404).json({ message: "Product not found" });
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

    if (req.body.title && req.body.title !== product.title) {
      product.slug = await getUniqueSlug(req.body.title, product._id);
    }

    if (req.body.title !== undefined) product.title = req.body.title;
    if (req.body.description !== undefined)
      product.description = req.body.description;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.material !== undefined) product.material = req.body.material;
    if (req.body.size !== undefined) product.size = req.body.size;
    if (req.body.thickness !== undefined)
      product.thickness = req.body.thickness;
    if (req.body.waterproof !== undefined) {
      product.waterproof =
        req.body.waterproof === "true" || req.body.waterproof === true;
    }
    if (req.body.category !== undefined) product.category = req.body.category;

    if (req.body.inStock !== undefined) {
      product.inStock =
        req.body.inStock === "true" || req.body.inStock === true;
    }
    if (req.body.active !== undefined) {
      product.active = req.body.active === "true" || req.body.active === true;
    }

    if (req.body.isCustomizable !== undefined) {
      product.isCustomizable =
        req.body.isCustomizable === "true" || req.body.isCustomizable === true;
    }
    if (req.body.sizes !== undefined) {
      product.sizes = req.body.sizes;
    }

    // images ला हात लावत नाही — तशाच राहतात.

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ---- Add Images ----
exports.addFeaturedProductImages = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        message: "Please select at least one image.",
      });
    }

    // Maximum 5 images
    if (product.images.length + files.length > 5) {
      return res.status(400).json({
        message: `You can have maximum 5 images. Currently you have ${product.images.length}.`,
      });
    }

    const newImages = await Promise.all(
      files.map(async (file) => {
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

    product.images.push(...newImages);

    await product.save();

    res.json({
      message: "Images added successfully.",
      images: product.images,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ---- Delete Single Image ----
exports.deleteFeaturedProductImage = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const image = product.images.id(req.params.imageId);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId, "image");
    }

    image.deleteOne();

    await product.save();

    res.json({
      message: "Image deleted successfully",
      images: product.images,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
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

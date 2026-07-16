const Product = require("../models/Product");
const GalleryDesign = require("../models/GalleryDesign");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  console.log('pande')
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {

    try {

        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        const product = await Product.create({

            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            width: req.body.width,
            height: req.body.height,
            productionType: req.body.productionType || "both",

            previewImage: req.files.previewImage
                ? req.files.previewImage[0].filename
                : "",

            svgTemplate: req.files.svgTemplate
                ? req.files.svgTemplate[0].filename
                : "",

            editableFields: JSON.parse(req.body.editableFields),

        });

        res.status(201).json(product);

    } catch (error) {

        console.error("Create Product Error:");
        console.error(error);

        res.status(500).json({
            message: error.message,
        });

    }

};

exports.getSimilarProducts = async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    console.log('k');
    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Similar customizable products
    const products = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
      active: true,
    }).limit(4);

    // Similar gallery designs
    const galleryDesigns = await GalleryDesign.find({
      category: currentProduct.category,
      active: true,
    }).limit(4);

    const productItems = products.map((product) => ({
      id: product._id,
      type: "product",
      name: product.name,
      price: product.price,
      previewImage: product.previewImage,
      category: product.category,
    }));

    const galleryItems = galleryDesigns.map((design) => ({
      id: design._id,
      type: "gallery",
      name: design.title,
      price: design.price,
      previewImage: design.images[0],
      category: design.category,
    }));

    res.json([...productItems, ...galleryItems]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
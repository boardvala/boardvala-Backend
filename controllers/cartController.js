const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.addToCart = async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const cartItem = await Cart.create({
      user: req.user.id,

      product: product._id,

      quantity: req.body.quantity || 1,

      customization: req.body.customization,

      finalSvg: req.body.finalSvg || "",
    });

    res.status(201).json(cartItem);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getCart = async (req, res) => {
  
  try {
    const items = await Cart.find({
      user: req.user.id,
    })

      .populate("product");

    res.json(items);
    
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const item = await Cart.findByIdAndUpdate(
      {
        _id: req.params.id,

        user: req.user.id,
      },

      {
        quantity: req.body.quantity,
      },

      {
        new: true,
      },
    );

    res.json(item);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    await Cart.findOneAndDelete({
      _id: req.params.id,

      user: req.user.id,
    });

    res.json({
      message: "Item removed",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.syncGuestCart = async (req, res) => {
  try {
    const items = req.body.items || [];

    for (const item of items) {
      await Cart.create({
        user: req.user.id,

        product: item.productId,

        quantity: item.quantity,

        customization: item.customization,

        finalSvg: item.finalSvg,
      });
    }

    res.json({
      message: "Guest cart synced.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

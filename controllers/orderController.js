const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user.id }).populate(
      "product",
    );

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const items = [];

    let totalAmount = 0;

    cartItems.forEach((item) => {
      items.push({
        product: item.product._id,

        quantity: item.quantity,

        price: item.product.price,

        customization: item.customization,

        finalSvg: item.finalSvg,
      });

      totalAmount += item.product.price * item.quantity;
    });

    const order = await Order.create({
      user: req.user.id,

      customerName: req.body.customerName,

      customerPhone: req.body.customerPhone,

      customerEmail: req.body.customerEmail,

      customerAddress: req.body.customerAddress,

      items,

      totalAmount,
    });

    await Cart.deleteMany({ user: req.user.id });

    res.status(201).json(order);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.find()

        .populate("items.product")

        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        user: req.user.id,
      })

        .populate("items.product")

        .sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getOrder = async (req, res) => {

  try {
    let order;

    if (req.user.role === "admin") {
      order = await Order.findById(req.params.id)

        .populate("items.product");
    } else {
      order = await Order.findOne({
        _id: req.params.id,

        user: req.user.id,
      })

        .populate("items.product");
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const CustomDesignOrder = require("../models/CustomDesignOrder");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

exports.createCustomDesignOrder = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Design file is required.",
      });
    }

    // Upload customer's file to Cloudinary
    const fileResult = await uploadToCloudinary(
      req.file,
      "boardvala/custom-designs"
    );

    const {
      frameSize,
      material,
      plateType,
      instructions,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
    } = req.body;

    const order = await CustomDesignOrder.create({
      user: req.user ? req.user._id : null,

      designFile: {
        url: fileResult.secure_url,
        publicId: fileResult.public_id,
      },

      frameSize,

      material,

      plateType,

      instructions,

      customerName,

      customerPhone,

      customerEmail,

      customerAddress,
    });

    res.status(201).json({
      success: true,
      message: "Custom Design Order Submitted Successfully.",
      order,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllCustomDesignOrders = async (req, res) => {
  try {
    const orders = await CustomDesignOrder.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getCustomDesignOrderById = async (req, res) => {
  try {
    const order = await CustomDesignOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateCustomDesignStatus = async (req, res) => {
  try {
    const order =
      await CustomDesignOrder.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
        },
        {
          new: true,
        }
      );

    res.json({
      success: true,
      message: "Status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const CustomDesignOrder = require("../models/CustomDesignOrder");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { getPriceForFrameSize } = require("./paymentController");

exports.createCustomDesignOrder = async (req, res) => {
  try {
    const {
      previewImage, // base64 data URL (data:image/png;base64,....)
      frameSize,
      orientation,
      instructions,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      payment,
    } = req.body;
 
    // --- basic validation ---
    if (!previewImage) {
      return res.status(400).json({
        success: false,
        message: "Design preview is required.",
      });
    }
 
    if (!frameSize) {
      return res.status(400).json({
        success: false,
        message: "Frame size is required.",
      });
    }
 
    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and address are required.",
      });
    }
 
    if (!payment) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }
 
    // --- duplicate guard ---
    const existingOrder = await CustomDesignOrder.findOne({ payment });
 
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Order already exists for this payment.",
      });
    }
 
    // --- price: frontend कडून नाही, database मधून (payment सारख्याच helper ने) ---
    const price = await getPriceForFrameSize(frameSize);
 
    // --- base64 design Cloudinary वर upload ---
    // uploadToCloudinary base64 data URL स्वीकारतो असे गृहीत.
    // (जर ती फक्त file/buffer घेत असेल, तर खाली टीप बघा.)
    const fileResult = await uploadToCloudinary(
      previewImage,
      "boardvala/custom-designs",
    );
 
    const order = await CustomDesignOrder.create({
      user: req.user ? req.user._id : null,
 
      designFile: {
        url: fileResult.secure_url,
        publicId: fileResult.public_id,
      },
 
      frameSize,
      orientation,
      price, // <-- database मधून, सुरक्षित
      instructions,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      payment,
    });
 
    res.status(201).json({
      success: true,
      message: "Custom Design Order Submitted Successfully.",
      order,
    });
  } catch (err) {
    console.error(err);
 
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
    const order = await CustomDesignOrder.findById(req.params.id).populate("payment");

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
    const order = await CustomDesignOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      },
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

exports.getMyCustomDesignOrders = async (req, res) => {
  try {
    const orders = await CustomDesignOrder.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your custom design orders",
    });
  }
};

exports.getMyCustomDesignOrderById = async (req, res) => {
  try {
    const order = await CustomDesignOrder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Custom design order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

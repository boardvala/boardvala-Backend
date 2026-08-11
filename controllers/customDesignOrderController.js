const CustomDesignOrder = require("../models/CustomDesignOrder");
const Pricing = require("../models/Pricing");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { getPriceForFrameSize } = require("./paymentController");
const { calculateBannerPrice } = require("../utils/bannerPricing");
const { sendOrderEmails } = require("../utils/orderEmails");

exports.createCustomDesignOrder = async (req, res) => {
  try {
    const {
      previewImage,
      frameSize,
      orientation,
      material,
      instructions,
      quantity,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      payment,
      // banner साठी
      width,
      length,
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

    if (!material) {
      return res.status(400).json({
        success: false,
        message: "Material is required.",
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

    const qty = quantity || 1;

    // --- price: frontend कडून नाही, database मधून (सुरक्षित) ---
    // material चा pricingType बघून banner की fixed ठरवतो.
    const pricingDoc = await Pricing.findOne({ material });

    if (!pricingDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid material or pricing not configured.",
      });
    }

    let price; // प्रति नग किंमत
    let totalAmount; // एकूण

    if (pricingDoc.pricingType === "banner") {
      // banner — width/length वरून गणना (qty आत धरलेली → totalAmount)
      if (!width || !length) {
        return res.status(400).json({
          success: false,
          message: "Banner width and length are required.",
        });
      }

      const result = await calculateBannerPrice(material, width, length, qty);
      totalAmount = result.finalPrice; // qty सह
      price = Math.round(totalAmount / qty); // प्रति नग (दाखवायला)
    } else {
      // fixed — frameSize नुसार
      price = await getPriceForFrameSize(frameSize, material);
      totalAmount = price * qty;
    }

    // --- base64 design Cloudinary वर upload ---
    const fileResult = await uploadToCloudinary(
      previewImage,
      "boardvala/custom-designs",
    );

    const order = await CustomDesignOrder.create({
      user: req.user ? req.user.id : null,

      designFile: {
        url: fileResult.secure_url,
        publicId: fileResult.public_id,
      },

      frameSize,
      orientation,
      material,
      price, // प्रति नग, database मधून
      totalAmount, // एकूण (qty सह)
      quantity: qty,
      instructions,

      // banner साठी (fixed ला undefined — साठवले जात नाहीत)
      bannerWidth:
        pricingDoc.pricingType === "banner" ? Number(width) : undefined,
      bannerLength:
        pricingDoc.pricingType === "banner" ? Number(length) : undefined,

      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      payment,
    });

    try {
      await sendOrderEmails(order);
    } catch (mailErr) {
      console.error("Order email failed:", mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Custom Design Order Submitted Successfully.",
      order,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
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
      user: req.user.id,
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
      user: req.user.id,
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

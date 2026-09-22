const CustomDesignOrder = require("../models/CustomDesignOrder");
const Pricing = require("../models/Pricing");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { getPriceForFrameSize } = require("./paymentController");
const { calculateBannerPrice } = require("../utils/bannerPricing");
const { sendOrderEmails, sendShippingEmail } = require("../utils/orderEmails");
const { trackShipment } = require("../utils/enviaTracking");
//const { pushOrderToShiprocket } = require("../utils/shiprocketOrder");
//const { getOrderStatus } = require("../utils/shiprocketTracking");

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
      customerCity, // ← नवीन
      customerState, // ← नवीन
      customerPincode, // ← नवीन
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

    // Shiprocket साठी pincode/city/state आवश्यक
    if (!customerCity || !customerState || !customerPincode) {
      return res.status(400).json({
        success: false,
        message: "City, state and pincode are required for delivery.",
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

    const order = await CustomDesignOrder.create({
      user: req.user ? req.user.id : null,

      designFile: {
        url: "",
        publicId: "",
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
      customerCity, // ← नवीन
      customerState, // ← नवीन
      customerPincode, // ← नवीन
      payment,
    });

    try {
      await sendOrderEmails(order);
    } catch (mailErr) {
      console.error("Order email failed:", mailErr.message);
    }

    // try {
    //   const items = [
    //     {
    //       name: `${order.material} - ${order.frameSize}`,
    //       sku: order._id.toString(),
    //       units: order.quantity,
    //       selling_price: order.price,
    //     },
    //   ];
    //   const sr = await pushOrderToShiprocket(order, items);
    //   order.shiprocketOrderId = sr.shiprocketOrderId;
    //   order.shiprocketShipmentId = sr.shipmentId;
    //   await order.save();
    // } catch (srErr) {
    //   console.error("Shiprocket push failed:", srErr.message);
    //   // order तुटू नये — फक्त log
    // }

    try {
      const designFile = await uploadToCloudinary(
        previewImage,
        "boardvala/custom-designs",
      );
      order.designFile = {
        url: designFile.secure_url,
        publicId: designFile.public_id,
      };
      await order.save();
    } catch (imgErr) {
      console.error(
        "Cloudinary upload failed, order:",
        order._id,
        imgErr.message,
      );
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

// exports.getOrderTracking = async (req, res) => {
//   try {
//     const order = await CustomDesignOrder.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
//     // security — हा order याच user चा आहे का (आठवा — my-orders pattern)
//     if (order.user && order.user.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: "Not allowed" });
//     }
//     if (!order.shiprocketOrderId) {
//       return res.json({ success: true, tracking: null, message: "Not shipped yet" });
//     }
//     const status = await getOrderStatus(order.shiprocketOrderId);
//     // मिळालं तर order मध्ये update (AWB save)
//     if (status?.awbCode && !order.awbCode) {
//       order.awbCode = status.awbCode;
//       order.courierName = status.courierName;
//       await order.save();
//     }
//     res.json({ success: true, tracking: status });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getAdminOrderTracking = async (req, res) => {
//   try {
//     const order = await CustomDesignOrder.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // admin — user security check नको (adminMiddleware ने संरक्षण)

//     if (!order.shiprocketOrderId) {
//       return res.json({ success: true, tracking: null, message: "Not shipped yet" });
//     }

//     const status = await getOrderStatus(order.shiprocketOrderId);

//     if (status?.awbCode && !order.awbCode) {
//       order.awbCode = status.awbCode;
//       order.courierName = status.courierName;
//       await order.save();
//     }

//     res.json({ success: true, tracking: status });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

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
    const order = await CustomDesignOrder.findById(req.params.id).populate(
      "payment",
    );

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

// ---- Admin: Update Shipping Details ----
exports.updateOrderShipping = async (req, res) => {
  try {
    const order = await CustomDesignOrder.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (req.body.trackingNumber !== undefined)
      order.trackingNumber = req.body.trackingNumber;
    if (req.body.courierName !== undefined)
      order.courierName = req.body.courierName;

    await order.save();
    let emailSent = false;
    // Tracking number save झाल्यावर → shipping email send
    if (req.body.trackingNumber && order.customerEmail) {
      try {
        await sendShippingEmail(order);
        emailSent = true;
      } catch (emailErr) {
        console.error("Shipping email failed:", emailErr.message);
        // Email fail → order save तरी success
      }
    }

    res.json({ success: true, order, emailSent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Track Shipment (Envia API) ----
exports.trackOrderShipment = async (req, res) => {
  try {
    const order = await CustomDesignOrder.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!order.trackingNumber) {
      return res.json({
        success: false,
        message: "No tracking number assigned yet.",
      });
    }

    const tracking = await trackShipment(order.trackingNumber);
    // DB मध्ये latest status update
    if (tracking.success && tracking.status) {
      order.shippingStatus = tracking.status;
      await order.save();
    }

    res.json({ success: true, tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

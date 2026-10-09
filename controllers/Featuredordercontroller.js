const FeaturedOrder = require("../models/Featuredorder");
const FeaturedProduct = require("../models/FeaturedProduct");
const { getFeaturedProductPrice } = require("./paymentController");
const { sendOrderEmails, sendShippingEmail } = require("../utils/orderEmails");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { trackShipment } = require("../utils/enviaTracking");
//const { pushOrderToShiprocket } = require("../utils/shiprocketOrder");
//const { getOrderStatus } = require("../utils/shiprocketTracking");

exports.createFeaturedOrder = async (req, res) => {
  try {
    const {
      featuredProductId,
      quantity,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity, // ← नवीन
      customerState, // ← नवीन
      customerPincode, // ← नवीन
      payment,
    } = req.body;

    // --- basic validation ---
    if (!featuredProductId) {
      return res.status(400).json({
        success: false,
        message: "Featured product is required.",
      });
    }

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and address are required.",
      });
    }

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

    // --- product database मधून (snapshot + खरी किंमत, frontend वर विश्वास नको) ---
    const product = await FeaturedProduct.findById(featuredProductId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Featured product not found.",
      });
    }

    // किंमत database मधून (active + inStock तपासतो)
    let price = await getFeaturedProductPrice(featuredProductId);
    const qty = quantity || 1;

    // LED Frame — price from selected size
    if (
      req.body.orderType === "ledFrame" &&
      req.body.frameSize &&
      product.sizes?.length > 0
    ) {
      const sizeName = req.body.frameSize.split("(")[0].trim(); // "A4 (9 × 12 inch)" → "A4"
      const matchedSize = product.sizes.find((s) => s.name === sizeName);
      if (matchedSize) {
        price = matchedSize.price;
      }
    }
    // LED Frame — upload customer photo to Cloudinary
    let customerPhotoUrl = "";
    if (req.body.customPhoto && req.body.orderType === "ledFrame") {
      try {
        // base64 → buffer → cloudinary
        const base64Data = req.body.customPhoto.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const uploadResult = await uploadToCloudinary(
          { buffer, mimetype: "image/jpeg" },
          "boardvala/led-frame-orders",
        );
        customerPhotoUrl = uploadResult.secure_url;
      } catch (err) {
        console.log("LED frame photo upload failed:", err.message);
      }
    }
    const order = await FeaturedOrder.create({
      user: req.user ? req.user.id : null,
      featuredProduct: product._id,
      // snapshot — order च्या वेळची माहिती
      title: product.title,
      price, // database मधून, सुरक्षित
      previewImage:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0].url
          : "",
      totalAmount: price * qty,
      quantity: qty,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity, // ← नवीन
      customerState, // ← नवीन
      customerPincode,
      payment,
      orderType: req.body.orderType || "featuredProduct",
      frameSize: req.body.frameSize || "",
      customerPhoto: customerPhotoUrl || "",
    });

    try {
      await sendOrderEmails(order);
    } catch (mailErr) {
      console.error("Order email failed:", mailErr.message);
    }

    // try {
    //   const items = [
    //     {
    //       name: order.title,
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

    res.status(201).json({
      success: true,
      message: "Featured Product Order Submitted Successfully.",
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// exports.getFeaturedOrderTracking = async (req, res) => {
//   try {
//     const order = await FeaturedOrder.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // security — याच user चा order का
//     if (order.user && order.user.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: "Not allowed" });
//     }

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

// exports.getAdminFeaturedOrderTracking = async (req, res) => {
//   try {
//     const order = await FeaturedOrder.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // admin — user security check नको (adminMiddleware संरक्षण)

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

exports.getAllFeaturedOrders = async (req, res) => {
  try {
    const orders = await FeaturedOrder.find().sort({ createdAt: -1 });

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

exports.getFeaturedOrderById = async (req, res) => {
  try {
    const order = await FeaturedOrder.findById(req.params.id).populate(
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

exports.updateFeaturedOrderStatus = async (req, res) => {
  try {
    const order = await FeaturedOrder.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
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

//for user's
exports.getMyFeaturedOrders = async (req, res) => {
  try {
    const orders = await FeaturedOrder.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your featured orders",
    });
  }
};

exports.getMyFeaturedOrderById = async (req, res) => {
  try {
    const order = await FeaturedOrder.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Featured order not found",
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
exports.updateFeaturedOrderShipping = async (req, res) => {
  try {
    const order = await FeaturedOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const wasEmpty = !order.trackingNumber;

    if (req.body.trackingNumber !== undefined)
      order.trackingNumber = req.body.trackingNumber;
    if (req.body.courierName !== undefined)
      order.courierName = req.body.courierName;

    await order.save();

    let emailSent = false;
    // First time tracking number save → shipping email
    if (wasEmpty && req.body.trackingNumber && order.customerEmail) {
      try {
        await sendShippingEmail(order);
        emailSent = true;
      } catch (emailErr) {
        console.error("Shipping email failed:", emailErr.message);
      }
    }

    res.json({ success: true, order, emailSent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Track Shipment (Envia API) ----
exports.trackFeaturedOrderShipment = async (req, res) => {
  try {
    const order = await FeaturedOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!order.trackingNumber) {
      return res.json({
        success: false,
        message: "No tracking number assigned yet.",
      });
    }

    const tracking = await trackShipment(order.trackingNumber);

    if (tracking.success && tracking.status) {
      order.shippingStatus = tracking.status;
      await order.save();
    }

    res.json({ success: true, tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

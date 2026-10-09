const mongoose = require("mongoose");

const featuredOrderSchema = new mongoose.Schema(
  {
    // कोणत्या user चा order (my-orders साठी)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // कोणता featured product (ref — तपशील हवे तेव्हा populate)
    featuredProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeaturedProduct",
      required: true,
    },

    // order च्या वेळचे snapshot (product पुढे बदलला/डिलीट झाला तरी टिकते)
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // प्रति नग, backend verified
    totalAmount: { type: Number, required: true, min: 0 },
    previewImage: { type: String, default: "" },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // ग्राहक माहिती (custom order सारखीच)
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerAddress: { type: String, default: "" },

    // Shiprocket साठी — structured address
    customerCity: {
      type: String,
      required: true,
    },
    customerState: {
      type: String,
      required: true,
    },
    customerPincode: {
      type: String,
      required: true,
    },

    // Shiprocket tracking (push नंतर भरतील — optional)
    // shiprocketOrderId: { type: String },
    // shiprocketShipmentId: { type: String },
    // awbCode: { type: String },
    // courierName: { type: String },

    trackingNumber: { type: String, default: "" },
    courierName: { type: String, default: "" },
    shippingStatus: {
      type: String,
      default: "Picked Up",
    },

    // payment ref
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },

    customerPhoto: { type: String, default: "" },
    frameSize: { type: String, default: "" },
    orderType: { type: String, default: "featuredProduct" },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FeaturedOrder", featuredOrderSchema);

const mongoose = require("mongoose");

const customDesignOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    designFile: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    frameSize: {
      type: String,
      required: true,
    },

    orientation: {
      type: String,
      enum: ["Landscape", "Portrait", ""], // "" जोडा (banner साठी)
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    totalAmount: { type: Number, required: true },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    // Customer selects this at upload time
    material: {
      type: String,
      required: true,
    },

    // Currently every custom order is 2D
    plateType: {
      type: String,
      enum: ["2D"],
      default: "2D",
    },

    instructions: {
      type: String,
      default: "",
    },

    bannerWidth: { type: Number },
    bannerLength: { type: Number },

    customerName: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      default: "",
    },

    customerAddress: {
      type: String,
      required: true,
    },

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

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },

    // Shiprocket tracking
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
    awbCode: { type: String }, // tracking number
    courierName: { type: String },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CustomDesignOrder", customDesignOrderSchema);

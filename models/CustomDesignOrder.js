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
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },

    frameSize: {
      type: String,
      required: true,
    },

    orientation: {
      type: String,
      enum: ["Landscape", "Portrait"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // Customer selects this at upload time
    material: {
      type: String,
      enum: ["MDF", "Acrylic", "Sunboard", "Vinyl"],
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

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },

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
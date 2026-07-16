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

    material: {
      type: String,
      required: true,
    },

    plateType: {
      type: String,
      enum: ["2D", "3D"],
      required: true,
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CustomDesignOrder", customDesignOrderSchema);

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

     // Admin will assign this later
    material: {
      type: String,
      enum: ["", "Acrylic", "Wooden", "Steel"],
      default: "",
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CustomDesignOrder", customDesignOrderSchema);

const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    _id: false,
  },
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Product",

      required: true,
    },

    quantity: {
      type: Number,

      default: 1,
    },

    price: {
      type: Number,

      required: true,
    },

    customization: customizationSchema,

    finalSvg: {
      type: String,

      default: "",
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
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

    items: [orderItemSchema],

    totalAmount: {
      type: Number,

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

module.exports = mongoose.model("Order", orderSchema);

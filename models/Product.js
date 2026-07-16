const mongoose = require("mongoose");

const editableFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      default: "text",
    },

    defaultValue: {
      type: String,
      default: "",
    },

    defaultStyle: {
      fontFamily: {
        type: String,
        default: "Poppins",
      },

      fontSize: {
        type: Number,
        default: 40,
      },

      fontColor: {
        type: String,
        default: "#ffffff",
      },

      fontWeight: {
        type: String,
        default: "700",
      },
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    category: String,

    width: {
      type: Number,
      required: true,
    },

    height: {
      type: Number,
      required: true,
    },

    previewImage: {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },

    svgTemplate: {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },

    productionType: {
      type: String,
      enum: ["uv", "laser", "both"],
      default: "both",
    },

    editableFields: [editableFieldSchema],

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);

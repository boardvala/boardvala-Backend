const mongoose = require("mongoose");

const framePriceSchema = new mongoose.Schema(
  {
    frameSize: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const galleryDesignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Acrylic", "Wooden", "Steel"],
    },

    // Used for Acrylic & Steel
    price: {
      type: Number,
      default: null,
    },

    // Used only for Wooden
    framePrices: [framePriceSchema],

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GalleryDesign", galleryDesignSchema);
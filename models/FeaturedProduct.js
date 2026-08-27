const mongoose = require("mongoose");

const featuredProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // किंमत admin टाकतो, साठवली जाते (material/size वर अवलंबून नाही)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // model मध्ये schema मध्ये जोडा:
    material: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    thickness: {
      type: String,
      default: "",
    },
    waterproof: {
      type: Boolean,
      default: false,
    },

    // सध्या साधं text — नंतर enum/categories करता येईल
    category: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary images (gallery सारखं)
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],

    inStock: {
      type: Boolean,
      default: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FeaturedProduct", featuredProductSchema);

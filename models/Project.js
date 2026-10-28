const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Hospital", "Mall", "Shop", "Office", "School"
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      // e.g. "Pune, Maharashtra"
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    coverImage: {
      // Home section marquee मध्ये दिसणारी image (पहिली image default)
      url: String,
      publicId: String,
    },
    featured: {
      type: Boolean,
      default: false,
      // true = home page वर दाखवा
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
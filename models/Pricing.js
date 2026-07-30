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

const pricingSchema = new mongoose.Schema(
  {
    material: {
      type: String,
      required: true,
      unique: true,
      enum: ["MDF", "Acrylic", "Sunboard", "Vinyl"],
    },

    framePrices: [framePriceSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pricing", pricingSchema);
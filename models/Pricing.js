const mongoose = require("mongoose");

const framePriceSchema = new mongoose.Schema(
  {
    frameSize: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const pricingSchema = new mongoose.Schema(
  {
    material: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // किंमत कशी ठरते:
    // "fixed"  → framePrices यादीतून (सध्याचे materials)
    // "banner" → size × rate गणना (roll, ₹/sqft, min order)
    pricingType: {
      type: String,
      enum: ["fixed", "banner"],
      default: "fixed",
    },

    // ---- fixed साठी (सध्याचे, तसेच) ----
    framePrices: {
      type: [framePriceSchema],
      default: [],
    },

    // ---- banner साठी (pricingType === "banner" तेव्हाच वापरले) ----
    ratePerSqFt: {
      type: Number, // उदा. 20 (₹ प्रति चौरस फूट)
    },
    availableRolls: {
      type: [Number], // उदा. [3, 4, 5, 6] (उपलब्ध roll widths, ft)
      default: [],
    },
    minOrderValue: {
      type: Number, // उदा. 500 (किमान order किंमत)
    },
    maxLength: {
      type: Number, // उदा. 100 (कमाल लांबी, ft)
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Pricing", pricingSchema);
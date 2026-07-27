const Pricing = require("../models/Pricing");

// Create Pricing
exports.createPricing = async (req, res) => {
  try {
    const pricing = await Pricing.create(req.body);

    res.status(201).json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Pricing
exports.getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.find().sort({ material: 1 });

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Pricing by Material
exports.getPricingByMaterial = async (req, res) => {
  try {
    const pricing = await Pricing.findOne({
      material: req.params.material,
    });

    if (!pricing) {
      return res.status(404).json({
        message: "Pricing not found",
      });
    }

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Pricing
exports.updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOneAndUpdate(
      {
        material: req.params.material,
      },
      {
        framePrices: req.body.framePrices,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!pricing) {
      return res.status(404).json({
        message: "Pricing not found",
      });
    }

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
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

// Update Pricing (framePrices — fixed materials)
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
      },
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

// Create material — pricingType सह (fixed किंवा banner)
exports.createMaterial = async (req, res) => {
  try {
    const { material, pricingType } = req.body;

    const exists = await Pricing.findOne({ material });

    if (exists) {
      return res.status(400).json({
        message: "Material already exists",
      });
    }

    const type = pricingType === "banner" ? "banner" : "fixed";

    const pricing = await Pricing.create({
      material,
      pricingType: type,
      framePrices: [],
      // banner ला defaults — admin नंतर settings मधून बदलेल
      ...(type === "banner"
        ? {
            ratePerSqFt: 0,
            availableRolls: [],
            minOrderValue: 0,
            maxLength: 0,
          }
        : {}),
    });

    res.status(201).json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Banner settings update (rate, rolls, min, maxLength)
exports.updateBannerSettings = async (req, res) => {
  try {
    const { ratePerSqFt, availableRolls, minOrderValue, maxLength } = req.body;

    const pricing = await Pricing.findOne({ material: req.params.material });

    if (!pricing) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    if (pricing.pricingType !== "banner") {
      return res.status(400).json({
        message: "This material does not use banner pricing.",
      });
    }

    // rolls — string ("3,4,5,6") किंवा array दोन्ही स्वीकारा, numbers मध्ये
    let rolls = availableRolls;
    if (typeof rolls === "string") {
      rolls = rolls
        .split(",")
        .map((r) => Number(r.trim()))
        .filter((r) => !isNaN(r) && r > 0);
    } else if (Array.isArray(rolls)) {
      rolls = rolls.map((r) => Number(r)).filter((r) => !isNaN(r) && r > 0);
    } else {
      rolls = [];
    }

    pricing.ratePerSqFt = Number(ratePerSqFt) || 0;
    pricing.availableRolls = rolls;
    pricing.minOrderValue = Number(minOrderValue) || 0;
    pricing.maxLength = Number(maxLength) || 0;

    await pricing.save();

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    await Pricing.findOneAndDelete({
      material: req.params.material,
    });

    res.json({
      message: "Material deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.addFrameSize = async (req, res) => {
  try {
    const { frameSize, price } = req.body;

    const pricing = await Pricing.findOne({
      material: req.params.material,
    });

    if (!pricing) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    const exists = pricing.framePrices.find((x) => x.frameSize === frameSize);

    if (exists) {
      return res.status(400).json({
        message: "Frame size already exists",
      });
    }

    pricing.framePrices.push({
      frameSize,
      price,
    });

    await pricing.save();

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteFrameSize = async (req, res) => {
  try {
    const pricing = await Pricing.findOne({
      material: req.params.material,
    });

    if (!pricing) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    pricing.framePrices = pricing.framePrices.filter(
      (x) => x.frameSize !== req.params.frameSize,
    );

    await pricing.save();

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateFrameSize = async (req, res) => {
  try {
    const { material, frameSize } = req.params;
    const { newFrameSize, price } = req.body;

    const pricing = await Pricing.findOne({ material });

    if (!pricing) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    const frame = pricing.framePrices.find((f) => f.frameSize === frameSize);

    if (!frame) {
      return res.status(404).json({
        message: "Frame size not found",
      });
    }

    frame.frameSize = newFrameSize;
    frame.price = price;

    await pricing.save();

    res.json(pricing);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const { checkPincodeServiceability } = require("../utils/shiprocketServiceability");

exports.checkDelivery = async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit pincode required.",
      });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;

    if (!pickupPincode) {
      return res.status(500).json({
        success: false,
        message: "Pickup pincode not configured.",
      });
    }

    const result = await checkPincodeServiceability(pickupPincode, pincode);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Delivery check error:", err.message);
    res.status(500).json({
      success: false,
      message: "Could not check delivery. Please try again.",
    });
  }
};
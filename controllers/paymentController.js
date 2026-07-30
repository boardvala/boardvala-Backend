const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const Pricing = require("../models/Pricing");

// वैध materials — Pricing model च्या enum शी जुळलेले.
const VALID_MATERIALS = ["MDF", "Acrylic", "Sunboard", "Vinyl"];

// frameSize + material वरून database मधून खरी किंमत काढतो.
// frontend कडून येणारी material आधी तपासली जाते (bogus material टाळण्यासाठी).
async function getPriceForFrameSize(frameSize, material) {
  if (!material || !VALID_MATERIALS.includes(material)) {
    throw new Error("Invalid material.");
  }

  const pricing = await Pricing.findOne({ material });

  if (!pricing) {
    throw new Error("Pricing not configured for this material.");
  }

  const item = pricing.framePrices.find((p) => p.frameSize === frameSize);

  if (!item) {
    throw new Error("Invalid frame size.");
  }

  return item.price; // <-- हीच खरी, विश्वसनीय किंमत (रुपयांत)
}

exports.getPriceForFrameSize = getPriceForFrameSize;

exports.createPaymentOrder = async (req, res) => {
  try {
    const { frameSize, material } = req.body;

    if (!frameSize) {
      return res.status(400).json({
        success: false,
        message: "Frame size is required.",
      });
    }

    if (!material) {
      return res.status(400).json({
        success: false,
        message: "Material is required.",
      });
    }

    // frontend ने amount पाठवला तरी तो पूर्णपणे दुर्लक्षित.
    // किंमत फक्त database मधून, निवडलेल्या material नुसार.
    const price = await getPriceForFrameSize(frameSize, material);

    const options = {
      amount: Math.round(price * 100), // रुपये -> पैसे
      currency: "INR",
      receipt: `receipts_${Date.now()}`,
      notes: {
        frameSize,
        material,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Prevent duplicate payment records
    const existingPayment = await Payment.findOne({
      paymentId: razorpay_payment_id,
    });

    let savedPayment = existingPayment;

    if (!savedPayment) {
      savedPayment = await Payment.create({
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: payment.status,
        amountPaid: payment.amount / 100,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: savedPayment._id,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
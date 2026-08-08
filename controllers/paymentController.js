const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const Pricing = require("../models/Pricing");
const FeaturedProduct = require("../models/FeaturedProduct");

const VALID_MATERIALS = ["MDF", "Acrylic", "Sunboard", "Vinyl"];

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

  return item.price;
}

exports.getPriceForFrameSize = getPriceForFrameSize;

// featured product ची खरी किंमत database मधून (cart वर विश्वास नको)
async function getFeaturedProductPrice(featuredProductId) {
  const product = await FeaturedProduct.findById(featuredProductId);

  if (!product) {
    throw new Error("Featured product not found.");
  }

  if (!product.active || !product.inStock) {
    throw new Error("This product is not available for order.");
  }

  return product.price;
}

exports.getFeaturedProductPrice = getFeaturedProductPrice;

exports.createPaymentOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    let total = 0;

    for (const item of items) {
      let price;

      if (item.orderType === "featuredProduct") {
        price = await getFeaturedProductPrice(item.featuredProductId);
      } else {
        price = await getPriceForFrameSize(item.frameSize, item.material);
      }

      total += price * item.quantity;
    }

    const options = {
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipts_${Date.now()}`,
      notes: {
        itemCount: items.length,
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

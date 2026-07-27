const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);

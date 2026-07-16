const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,

      required: true,

      unique: true,

      trim: true,
    },

    password: {
      type: String,

      required: true,
    },

    role: {
      type: String,

      enum: ["admin", "user"],

      default: "user",
    },

    name: {
      type: String,

      default: "",
    },

    email: {
      type: String,

      default: "",
    },

    address: {
      type: String,

      default: "",
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);

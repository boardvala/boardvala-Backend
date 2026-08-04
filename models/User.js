const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
 
      required: true,

      unique: true,
 
      trim: true,
 
      lowercase: true,
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

    mobile: {
      type: String,

      default: "",

      trim: true,
    },

    address: {
      type: String,

      default: "",
    },

    // Forgot-password साठी — reset token आणि तो कधी expire होतो
    resetToken: {
      type: String,
 
      default: null,
    },
 
    resetTokenExpiry: {
      type: Date,
 
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);

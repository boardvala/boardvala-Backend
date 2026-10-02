const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["impression", "answer", "skip"], required: true },
    source: { type: String, default: "" },
    page: { type: String, default: "/" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Survey", surveySchema);
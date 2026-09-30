const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    page: { type: String, default: "/" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Survey", surveySchema);
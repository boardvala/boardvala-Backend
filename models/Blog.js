const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "" },
    tags: [{ type: String }],
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    author: { type: String, default: "BoardVala" },
    published: { type: Boolean, default: false },
    readTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
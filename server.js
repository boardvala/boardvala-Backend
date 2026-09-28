const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const app = express();
const sitemapRoutes = require("./routes/sitemapRoutes");
const productRoutes = require("./routes/productRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const customDesignOrderRoutes =  require("./routes/customDesignOrderRoutes");
const galleryDesignRoutes = require("./routes/galleryDesignRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const featuredProductRoutes = require("./routes/featuredProductRoutes");
const featuredOrderRoutes = require("./routes/featuredOrderRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const projectRoutes = require("./routes/projectRoutes");
const blogRoutes = require("./routes/blogRoutes");

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Google Search Console verification
app.get("/googledfba97c6a00197ad.html", (req, res) => {
  res.send("google-site-verification: googledfba97c6a00197ad.html");
});
app.use("/", sitemapRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customDesign", customDesignOrderRoutes);
app.use("/api/gallery", galleryDesignRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/featured-products", featuredProductRoutes);
app.use("/api/featured-orders", featuredOrderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    console.log("Database Name:", mongoose.connection.db.databaseName);
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});


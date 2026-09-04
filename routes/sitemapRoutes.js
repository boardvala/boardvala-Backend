const express = require("express");
const router = express.Router();
const GalleryDesign = require("../models/GalleryDesign");
const FeaturedProduct = require("../models/FeaturedProduct");
const Project = require("../models/Project");

const SITE_URL = "https://boardvala.com";

router.get("/sitemap.xml", async (req, res) => {
  try {
    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/custom-design", priority: "0.9", changefreq: "monthly" },
      { url: "/products", priority: "0.9", changefreq: "weekly" },
      { url: "/featured-products", priority: "0.9", changefreq: "weekly" },
      { url: "/about", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
    ];

    // Dynamic pages — DB मधून
    const [galleries, featured, projects] = await Promise.all([
      GalleryDesign.find({ active: true }).select("_id updatedAt").lean(),
      FeaturedProduct.find({ active: true }).select("_id updatedAt").lean(),
      Project.find({ active: true }).select("_id updatedAt").lean(),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static pages
    staticPages.forEach((page) => {
      xml += `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Gallery designs
    galleries.forEach((item) => {
      xml += `
  <url>
    <loc>${SITE_URL}/designs/${item._id}</loc>
    <lastmod>${new Date(item.updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Featured products
    featured.forEach((item) => {
      xml += `
  <url>
    <loc>${SITE_URL}/featured-products/${item._id}</loc>
    <lastmod>${new Date(item.updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Projects
    projects.forEach((item) => {
      xml += `
  <url>
    <loc>${SITE_URL}/projects/${item._id}</loc>
    <lastmod>${new Date(item.updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap error:", err.message);
    res.status(500).send("Sitemap generation failed");
  }
});

module.exports = router;
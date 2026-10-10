require("dotenv").config();
const mongoose = require("mongoose");
const GalleryDesign = require("./models/GalleryDesign");

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const designs = await GalleryDesign.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
  });
  console.log(`Found ${designs.length} designs without slug`);

  for (const design of designs) {
    let slug = generateSlug(design.title);
    let count = 0;
    let candidate = slug;
    while (
      await GalleryDesign.findOne({
        slug: candidate,
        _id: { $ne: design._id },
      })
    ) {
      count++;
      candidate = `${slug}-${count}`;
    }
    design.slug = candidate;
    await design.save();
    console.log(`✅ ${design.title} → ${design.slug}`);
  }

  console.log("Migration done!");
  mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
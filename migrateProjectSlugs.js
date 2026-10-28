require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("./models/Project");

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

  const projects = await Project.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
  });
  console.log(`Found ${projects.length} projects without slug`);

  for (const project of projects) {
    let slug = generateSlug(project.title);
    let count = 0;
    let candidate = slug;
    while (
      await Project.findOne({ slug: candidate, _id: { $ne: project._id } })
    ) {
      count++;
      candidate = `${slug}-${count}`;
    }
    project.slug = candidate;
    await project.save();
    console.log(`✅ ${project.title} → ${project.slug}`);
  }

  console.log("Migration done!");
  mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
const cloudinary = require("../config/cloudinary");

async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

module.exports = deleteFromCloudinary;
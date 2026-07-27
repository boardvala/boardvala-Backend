const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * दोन्ही स्वीकारतो:
 *  1) multer file object  { buffer, mimetype }   (product images वगैरे — जुनं वर्तन)
 *  2) base64 data URL string "data:image/png;base64,...."  (custom design preview)
 */
function uploadToCloudinary(input, folder) {
  // --- Case 1: base64 data URL (string) ---
  if (typeof input === "string") {
    const isSvg = input.startsWith("data:image/svg");

    return cloudinary.uploader
      .upload(input, {
        folder,
        resource_type: isSvg ? "raw" : "image",
      })
      .then((result) => result);
  }

  // --- Case 2: multer file object (buffer) — जुनं वर्तन जसंच्या तसं ---
  return new Promise((resolve, reject) => {
    if (!input || !input.buffer) {
      return reject(new Error("Invalid file input for upload."));
    }

    const isSvg = input.mimetype === "image/svg+xml";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isSvg ? "raw" : "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(input.buffer).pipe(stream);
  });
}

module.exports = uploadToCloudinary;
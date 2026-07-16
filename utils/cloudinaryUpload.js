const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

function uploadToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const isSvg = file.mimetype === "image/svg+xml";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isSvg ? "raw" : "image",
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

module.exports = uploadToCloudinary;
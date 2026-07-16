const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter(req, file, cb) {
    if (
      file.fieldname === "previewImage" &&
      !file.mimetype.startsWith("image/")
    ) {
      return cb(new Error("Preview image must be an image."));
    }

    if (
      file.fieldname === "svgTemplate" &&
      file.mimetype !== "image/svg+xml"
    ) {
      return cb(new Error("Only SVG files are allowed."));
    }

    cb(null, true);
  },
});

module.exports = upload;
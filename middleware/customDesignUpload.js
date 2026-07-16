const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    ".png",
    ".jpg", 
    ".jpeg",
    ".svg",
    ".pdf",
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, JPEG, SVG and PDF are allowed."));
  }
};

module.exports = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});
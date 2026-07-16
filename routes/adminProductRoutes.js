const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminProductController");

router.post(
  "/",
  upload.fields([
    {
      name: "previewImage",
      maxCount: 1,
    },
    {
      name: "svgTemplate",
      maxCount: 1,
    },
  ]),
  createProduct
);

router.get("/:id", getProduct);

router.put(
  "/:id",
  upload.fields([
    {
      name: "previewImage",
      maxCount: 1,
    },
    {
      name: "svgTemplate",
      maxCount: 1,
    },
  ]),
  updateProduct
);

router.delete("/:id", deleteProduct);

module.exports = router;
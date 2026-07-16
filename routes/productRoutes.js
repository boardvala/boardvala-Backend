const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
    getProducts,
    getProduct,
    createProduct,
    getSimilarProducts
} = require("../controllers/productController");

router.get("/", getProducts);

router.get("/:id", getProduct);

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

router.get("/:id/similar", getSimilarProducts);

module.exports = router;
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const {

    login,
    changePassword
} = require("../controllers/authController");

router.post("/login", login);

router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
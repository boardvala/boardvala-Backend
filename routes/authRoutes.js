const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const {

    login,
    changePassword,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
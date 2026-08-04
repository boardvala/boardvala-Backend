const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,

        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,

      role: user.role,

      email: user.email,

      mobile: user.mobile,

      name: user.name,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// हा function तुमच्या authController.js मध्ये जोडा (register/login सोबत).
// वरचे imports (User, bcrypt) आधीच आहेत असे गृहीत.

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // दोन्ही आवश्यक
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old and new password are required",
      });
    }

    // नवीन password किमान लांबी
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    // कोणाचा password बदलायचा — हे token मधून (req.user), frontend कडून नाही.
    // (auth middleware ने req.user सेट केलेला असतो.)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // जुना password बरोबर आहे का — असेल तरच पुढे
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Old password is incorrect",
      });
    }

    // नवीन password hash करून साठवा
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
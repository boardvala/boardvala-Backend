const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendemail");

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
 
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
 
    // सुरक्षा: user सापडला नाही तरी तोच संदेश द्या — म्हणजे कोणते emails
    // नोंदणीकृत आहेत हे बाहेरच्याला कळत नाही.
    if (!user) {
      return res.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }
 
    // एक random token बनवा
    const rawToken = crypto.randomBytes(32).toString("hex");
 
    // database मध्ये token चा hash साठवा (raw token फक्त email मध्ये जातो).
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
 
    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 मिनिटं
    await user.save();
 
    // ग्राहक उघडेल तो link (frontend चा reset पेज)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
 
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#0f172a;">Reset your BoardVala password</h2>
        <p>We received a request to reset your password. Click the button below to set a new one. This link is valid for 15 minutes.</p>
        <p style="text-align:center; margin: 28px 0;">
          <a href="${resetUrl}"
             style="background:#2563eb; color:#fff; text-decoration:none; padding:12px 28px; border-radius:10px; font-weight:bold; display:inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color:#64748b; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
 
    await sendEmail({
      to: user.email,
      subject: "Reset your BoardVala password",
      html,
    });
 
    res.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
 
// ---------- 2. Reset Password: token तपासतो, नवीन password सेट करतो ----------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
 
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }
 
    // email मधला raw token — त्याचा hash करून database शी जुळवा
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
 
    // token जुळतो का, आणि अजून expire झाला नाही ना
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
 
    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired.",
      });
    }
 
    // नवीन password साठवा, आणि token काढून टाका (पुन्हा वापरता येऊ नये)
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
 
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
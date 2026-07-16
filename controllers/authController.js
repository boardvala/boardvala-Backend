const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Mobile Number or Password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,

      user.password,
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Mobile Number or Password",
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

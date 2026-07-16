const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        message: "Mobile and Password are required",
      });
    }

    const existingUser = await User.findOne({
      mobile,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      mobile,

      password: hashedPassword,

      role: "user",
    });

    res.status(201).json({
      message: "Registration Successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

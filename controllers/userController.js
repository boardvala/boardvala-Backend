const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { email, mobile,  password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    // email नीट आहे का (basic तपासणी)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
 
    const existingUser = await User.findOne({
      email: cleanEmail,
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: "this email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.trim().toLowerCase(),
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
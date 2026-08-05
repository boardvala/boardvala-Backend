// Admin dashboard साठी counts देणारा controller.
// तुमच्या models चे नेमके path/नावं जुळवा.
const User = require("../models/User");
const CustomDesignOrder = require("../models/CustomDesignOrder");

exports.getDashboardStats = async (req, res) => {
  try {
    // फक्त 'user' role मोजा (admins वगळून) — हवं तर हा filter काढा
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalCustomOrders = await CustomDesignOrder.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders: totalCustomOrders,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
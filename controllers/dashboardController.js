// Admin dashboard साठी counts देणारा controller.
// तुमच्या models चे नेमके path/नावं जुळवा.
const User = require("../models/User");
const CustomDesignOrder = require("../models/CustomDesignOrder");
const FeaturedOrder = require("../models/Featuredorder");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });

    const totalCustomOrders = await CustomDesignOrder.countDocuments();

    const totalFeaturedOrders = await FeaturedOrder.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomOrders,
        totalFeaturedOrders,
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

exports.getRegisteredUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("email mobile createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const Survey = require("../models/Survey");

exports.submitSurvey = async (req, res) => {
  try {
    await Survey.create({
      type: req.body.type || "impression",
      source: req.body.source || "",
      page: req.body.page || "/",
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSurveyStats = async (req, res) => {
  try {
    const impressions = await Survey.countDocuments({ type: "impression" });

    // page-wise impression count (MongoDB aggregation)
    const pages = await Survey.aggregate([
      { $match: { type: "impression" } },
      { $group: { _id: "$page", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recent = await Survey.find({ type: "impression" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ impressions, pages, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
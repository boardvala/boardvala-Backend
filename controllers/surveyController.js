const Survey = require("../models/Survey");

exports.submitSurvey = async (req, res) => {
  try {
    await Survey.create({
      type: req.body.type || "answer",
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
    const answers = await Survey.countDocuments({ type: "answer" });
    const skips = await Survey.countDocuments({ type: "skip" });

    const sources = await Survey.aggregate([
      { $match: { type: "answer" } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recent = await Survey.find({ type: "answer" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ impressions, answers, skips, sources, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
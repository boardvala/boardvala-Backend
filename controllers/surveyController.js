const Survey = require("../models/Survey");

exports.submitSurvey = async (req, res) => {
  try {
    await Survey.create({
      source: req.body.source,
      page: req.body.page || "/",
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSurveyStats = async (req, res) => {
  try {
    const total = await Survey.countDocuments();
    const stats = await Survey.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recent = await Survey.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ total, stats, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// हा authMiddleware नंतर लावायचा.
// authMiddleware आधी req.user सेट करतो (token मधून, role सह),
// मग हा तपासतो की तो role खरंच "admin" आहे का.
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }

  next();
};
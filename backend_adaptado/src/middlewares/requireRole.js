// middlewares/requireRole.js
module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};
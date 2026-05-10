const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return error(res, 'Token no proporcionado', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol }
    next();
  } catch (err) {
    return error(res, 'Token inválido o expirado', 401);
  }
};

module.exports = verifyToken;

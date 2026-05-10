const { error } = require('../utils/response');

/**
 * Middleware de autorización por roles
 * Roles: admin, ejecutivo, operador, analista, cliente_b2b, cliente_b2c
 */
const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'No autenticado', 401);
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return error(res, 'No tienes permisos para esta acción', 403);
    }
    next();
  };
};

module.exports = authorizeRoles;

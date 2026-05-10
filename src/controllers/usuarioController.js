const usuarioService = require('../services/usuarioService');
const { success } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const usuario = await usuarioService.register(req.body);
    success(res, usuario, 'Usuario registrado', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await usuarioService.login(req.body.email, req.body.password);
    success(res, result, 'Login exitoso');
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const usuario = await usuarioService.getProfile(req.user.id);
    success(res, usuario);
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile };

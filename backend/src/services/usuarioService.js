const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const register = async (data) => {
  const { nombre, email, password, rol = 'cliente_b2c', tipo_cliente = 'b2c' } = data;
  const existente = await Usuario.findByEmail(email);
  if (existente) throw { statusCode: 409, message: 'El correo ya está registrado' };

  const password_hash = await bcrypt.hash(password, 10);
  const id = await Usuario.create({ nombre, email, password_hash, rol, tipo_cliente });
  return { id_usuario: id, nombre, email, rol };
};

const login = async (email, password) => {
  const usuario = await Usuario.findByEmail(email);
  if (!usuario) throw { statusCode: 401, message: 'Credenciales inválidas' };

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) throw { statusCode: 401, message: 'Credenciales inválidas' };

  const token = jwt.sign(
    { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    usuario: { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  };
};

const getProfile = async (id) => {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };
  return usuario;
};

module.exports = { register, login, getProfile };

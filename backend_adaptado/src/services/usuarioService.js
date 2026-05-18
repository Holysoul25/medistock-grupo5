const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const register = async (data) => {
  const {
    nombre,
    apellido = '',
    email,
    password,
    rol = 'cliente',
    tipo_cliente = 'B2C',
    rut,
    razon_social = null,
    telefono = null,
  } = data;

  if (!rut) throw { statusCode: 400, message: 'El campo rut es obligatorio' };

  // Verificar email duplicado
  const existente = await Usuario.findByEmail(email);
  if (existente) throw { statusCode: 409, message: 'El correo ya está registrado' };

  // Resolver FK de rol
  const rolRow = await Usuario.findRolByNombre(rol);
  if (!rolRow) throw { statusCode: 400, message: `Rol inválido: ${rol}. Válidos: admin, ejecutivo, operador, analista, cliente` };

  const password_hash = await bcrypt.hash(password, 10);

  // Crear usuario
  const id_usuario = await Usuario.create({
    nombre,
    apellido,
    email,
    password_hash,
    id_rol: rolRow.id_rol,
    telefono,
  });

  // Crear entrada en tabla cliente
  const tipoClienteRow = await Usuario.findTipoClienteByNombre(tipo_cliente.toUpperCase());
  if (!tipoClienteRow) throw { statusCode: 400, message: `tipo_cliente inválido: ${tipo_cliente}. Válidos: B2C, B2B` };

  await Usuario.createCliente(id_usuario, tipoClienteRow.id_tipo_cliente, rut, razon_social);

  return { id_usuario, nombre, apellido, email, rol };
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
    usuario: {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
};

const getProfile = async (id) => {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };

  // Incluir datos del cliente si existen
  const clienteInfo = await Usuario.findClienteByUsuario(id);
  return { ...usuario, cliente: clienteInfo || null };
};

module.exports = { register, login, getProfile };

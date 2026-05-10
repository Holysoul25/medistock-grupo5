const db = require('../config/db');

const Usuario = {
  /**
   * Busca un usuario por email junto con su rol (JOIN con tabla rol)
   */
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password_hash,
              r.nombre AS rol, u.activo
       FROM usuario u
       JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.email = ? AND u.activo = 1`,
      [email]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email,
              r.nombre AS rol, u.telefono
       FROM usuario u
       JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ? AND u.activo = 1`,
      [id]
    );
    return rows[0] || null;
  },

  findRolByNombre: async (nombreRol) => {
    const [rows] = await db.query(
      'SELECT id_rol FROM rol WHERE nombre = ? AND activo = 1',
      [nombreRol]
    );
    return rows[0] || null;
  },

  create: async (usuario) => {
    const { nombre, apellido = '', email, password_hash, id_rol, telefono = null } = usuario;
    const [result] = await db.query(
      'INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol, telefono) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, password_hash, id_rol, telefono]
    );
    return result.insertId;
  },

  findTipoClienteByNombre: async (nombre) => {
    const [rows] = await db.query(
      'SELECT id_tipo_cliente FROM tipo_cliente WHERE nombre = ?',
      [nombre]
    );
    return rows[0] || null;
  },

  createCliente: async (id_usuario, id_tipo_cliente, rut, razon_social = null) => {
    const [result] = await db.query(
      'INSERT INTO cliente (id_usuario, id_tipo_cliente, rut, razon_social) VALUES (?, ?, ?, ?)',
      [id_usuario, id_tipo_cliente, rut, razon_social]
    );
    return result.insertId;
  },

  findClienteByUsuario: async (id_usuario) => {
    const [rows] = await db.query(
      `SELECT c.id_cliente, c.rut, c.razon_social,
              tc.nombre AS tipo_cliente
       FROM cliente c
       JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
       WHERE c.id_usuario = ? AND c.activo = 1`,
      [id_usuario]
    );
    return rows[0] || null;
  },
};

module.exports = Usuario;

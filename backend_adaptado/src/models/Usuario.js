const db = require('../config/db');

const Usuario = {
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT u.*, r.nombre AS rol
     FROM usuario u
     JOIN rol r ON u.id_rol = r.id_rol
     WHERE u.email = ? AND u.activo = 1`,
      [email]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, email, rol, tipo_cliente FROM usuarios WHERE id_usuario = ? AND activo = 1',
      [id]
    );
    return rows[0] || null;
  },

  create: async (usuario) => {
    const { nombre, apellido, email, password_hash, id_rol, telefono } = usuario;
    const [result] = await db.query(
      `INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol, telefono)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, email, password_hash, id_rol, telefono]
    );
    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email,
            u.telefono, u.activo, r.nombre AS rol
     FROM usuario u
     JOIN rol r ON u.id_rol = r.id_rol
     ORDER BY u.created_at DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email,
            u.telefono, u.activo, r.nombre AS rol, u.id_rol
     FROM usuario u
     JOIN rol r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ?`,
      [id]
    );
    return rows[0] || null;
  },

  updateById: async (id, data) => {
    const { nombre, apellido, email, telefono, activo, id_rol } = data;
    await db.query(
      `UPDATE usuario
     SET nombre=?, apellido=?, email=?, telefono=?, activo=?, id_rol=?,
         updated_at=NOW()
     WHERE id_usuario=?`,
      [nombre, apellido, email, telefono ?? 1, activo ?? 1, id_rol, id]
    );
    return await Usuario.findById(id);
  },

  deleteById: async (id) => {
    // Soft delete: solo desactiva, no borra físicamente
    await db.query(
      'UPDATE usuario SET activo = 0, updated_at = NOW() WHERE id_usuario = ?',
      [id]
    );
  },

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email,
            u.telefono, u.activo, r.nombre AS rol, u.id_rol
     FROM usuario u
     JOIN rol r ON u.id_rol = r.id_rol
     ORDER BY u.created_at DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email,
            u.telefono, u.activo, r.nombre AS rol, u.id_rol
     FROM usuario u
     JOIN rol r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ?`,
      [id]
    );
    return rows[0] || null;
  },

  updateById: async (id, data) => {
    const { nombre, apellido, email, telefono, activo, id_rol } = data;
    await db.query(
      `UPDATE usuario
     SET nombre=?, apellido=?, email=?, telefono=?, activo=?, id_rol=?,
         updated_at=NOW()
     WHERE id_usuario=?`,
      [nombre, apellido, email, telefono ?? 1, activo ?? 1, id_rol, id]
    );
    return await Usuario.findById(id);
  },

  deleteById: async (id) => {
    // Soft delete: solo desactiva, no borra físicamente
    await db.query(
      'UPDATE usuario SET activo = 0, updated_at = NOW() WHERE id_usuario = ?',
      [id]
    );
  },

  // En Usuario.js, agrega esta función:
  findClienteByUsuario: async (id_usuario) => {
    const [rows] = await db.query(
      `SELECT cl.id_cliente, cl.rut, cl.razon_social, cl.direccion,
            cl.ciudad, cl.region, cl.activo,
            tc.nombre AS tipo_cliente
     FROM cliente cl
     JOIN tipo_cliente tc ON cl.id_tipo_cliente = tc.id_tipo_cliente
     WHERE cl.id_usuario = ?`,
      [id_usuario]
    );
    return rows[0] || null;
  },
  findRolByNombre: async (nombre) => {
    const [rows] = await db.query(
      'SELECT id_rol FROM rol WHERE nombre = ?',
      [nombre]
    );
    return rows[0] || null;
  },

  findTipoClienteByNombre: async (nombre) => {
    const [rows] = await db.query(
      'SELECT id_tipo_cliente FROM tipo_cliente WHERE nombre = ?',
      [nombre]
    );
    return rows[0] || null;
  },

  createCliente: async (id_usuario, id_tipo_cliente, rut, razon_social) => {
    await db.query(
      `INSERT INTO cliente (id_usuario, id_tipo_cliente, rut, razon_social)
     VALUES (?, ?, ?, ?)`,
      [id_usuario, id_tipo_cliente, rut, razon_social]
    );
  },
};



module.exports = Usuario;

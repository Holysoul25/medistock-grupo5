const db = require('../config/db');

const Usuario = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
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
    const { nombre, email, password_hash, rol, tipo_cliente } = usuario;
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, tipo_cliente) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, password_hash, rol, tipo_cliente]
    );
    return result.insertId;
  },
};

module.exports = Usuario;

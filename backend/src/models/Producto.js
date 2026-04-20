const db = require('../config/db');

const Producto = {
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM productos WHERE activo = 1');
    return rows;
  },

  findByCodigo: async (codigo) => {
    const [rows] = await db.query('SELECT * FROM productos WHERE codigo_producto = ? AND activo = 1', [codigo]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ? AND activo = 1', [id]);
    return rows[0] || null;
  },

  create: async (producto) => {
    const { codigo_producto, nombre, descripcion, precio, categoria, unidad_medida } = producto;
    const [result] = await db.query(
      'INSERT INTO productos (codigo_producto, nombre, descripcion, precio, categoria, unidad_medida) VALUES (?, ?, ?, ?, ?, ?)',
      [codigo_producto, nombre, descripcion, precio, categoria, unidad_medida]
    );
    return result.insertId;
  },

  update: async (id, campos) => {
    const { nombre, descripcion, precio, categoria, unidad_medida } = campos;
    const [result] = await db.query(
      'UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria=?, unidad_medida=? WHERE id_producto=?',
      [nombre, descripcion, precio, categoria, unidad_medida, id]
    );
    return result.affectedRows;
  },

  softDelete: async (id) => {
    const [result] = await db.query('UPDATE productos SET activo = 0 WHERE id_producto = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = Producto;

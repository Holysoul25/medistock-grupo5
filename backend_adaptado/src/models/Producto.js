const db = require('../config/db');

const Producto = {
  findAll: async (incluirInactivos = false) => {
    const [rows] = await db.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.descripcion,
            p.unidad_medida, p.precio_unitario AS precio,
            c.nombre AS categoria, p.requiere_receta, p.activo,
            COALESCE(SUM(s.cantidad), 0) AS stock_total,
            COALESCE(MIN(s.stock_minimo), 0) AS stock_minimo
     FROM producto p
     JOIN categoria c ON p.id_categoria = c.id_categoria
     LEFT JOIN stock s ON p.id_producto = s.id_producto
     ${incluirInactivos ? '' : 'WHERE p.activo = 1'}
     GROUP BY p.id_producto
     ORDER BY p.nombre`
    );
    return rows;
  },


  findByCodigo: async (codigo) => {
    const [rows] = await db.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.descripcion,
              p.unidad_medida, p.precio_unitario AS precio,
              c.nombre AS categoria, p.requiere_receta
       FROM producto p
       JOIN categoria c ON p.id_categoria = c.id_categoria
       WHERE p.codigo_producto = ? AND p.activo = 1`,
      [codigo]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.descripcion,
              p.unidad_medida, p.precio_unitario AS precio,
              c.nombre AS categoria, p.requiere_receta
       FROM producto p
       JOIN categoria c ON p.id_categoria = c.id_categoria
       WHERE p.id_producto = ? AND p.activo = 1`,
      [id]
    );
    return rows[0] || null;
  },

  findOrCreateCategoria: async (nombreCategoria) => {
    const [rows] = await db.query(
      'SELECT id_categoria FROM categoria WHERE nombre = ?',
      [nombreCategoria]
    );
    if (rows[0]) return rows[0].id_categoria;
    const [result] = await db.query(
      'INSERT INTO categoria (nombre) VALUES (?)',
      [nombreCategoria]
    );
    return result.insertId;
  },

  create: async (producto) => {
    const { codigo_producto, nombre, descripcion, precio_unitario, id_categoria, unidad_medida, requiere_receta = 0 } = producto;
    const [result] = await db.query(
      `INSERT INTO producto (codigo_producto, nombre, descripcion, precio_unitario, id_categoria, unidad_medida, requiere_receta)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [codigo_producto, nombre, descripcion, precio_unitario, id_categoria, unidad_medida, requiere_receta]
    );
    return result.insertId;
  },

  update: async (id, campos) => {
    const { nombre, descripcion, precio_unitario, id_categoria, unidad_medida, requiere_receta } = campos;
    const [result] = await db.query(
      `UPDATE producto SET nombre=?, descripcion=?, precio_unitario=?,
       id_categoria=?, unidad_medida=?, requiere_receta=?
       WHERE id_producto=?`,
      [nombre, descripcion, precio_unitario, id_categoria, unidad_medida, requiere_receta, id]
    );
    return result.affectedRows;
  },

  softDelete: async (id) => {
    const [result] = await db.query(
      'UPDATE producto SET activo = 0 WHERE id_producto = ?',
      [id]
    );
    return result.affectedRows;
  },
  reactivar: async (id) => {
    const [result] = await db.query(
      'UPDATE producto SET activo = 1 WHERE id_producto = ?', [id]
    );
    return result.affectedRows;
  },

  hardDelete: async (id) => {
    // No podemos borrar físicamente si tiene pedidos asociados
    // Usamos soft delete
    const [result] = await db.query(
      'UPDATE producto SET activo = 0 WHERE id_producto = ?', [id]
    );
    return result.affectedRows;
  },
};

module.exports = Producto;
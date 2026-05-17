const db = require('../config/db');

const Stock = {
  findByProducto: async (id_producto) => {
    const [rows] = await db.query(
      `SELECT s.id_stock, s.cantidad, s.stock_minimo,
              b.id_bodega, b.nombre AS bodega, b.ubicacion
       FROM stock s
       JOIN bodega b ON s.id_bodega = b.id_bodega
       WHERE s.id_producto = ?`,
      [id_producto]
    );
    return rows;
  },

  findByBodega: async (id_bodega) => {
    const [rows] = await db.query(
      `SELECT s.id_stock, s.cantidad, s.stock_minimo,
              p.id_producto, p.nombre AS producto, p.codigo_producto
       FROM stock s
       JOIN producto p ON s.id_producto = p.id_producto
       WHERE s.id_bodega = ?`,
      [id_bodega]
    );
    return rows;
  },

  updateStock: async (id_producto, id_bodega, cantidad) => {
    const [result] = await db.query(
      `UPDATE stock SET cantidad = cantidad + ?
       WHERE id_producto = ? AND id_bodega = ?`,
      [cantidad, id_producto, id_bodega]
    );
    return result.affectedRows;
  },
  create: async ({ id_producto, id_bodega, cantidad, stock_minimo }) => {
    await db.query(
      `INSERT INTO stock (id_producto, id_bodega, cantidad, stock_minimo)
       VALUES (?, ?, ?, ?)`,
      [id_producto, id_bodega, cantidad, stock_minimo]
    );
  },
};



module.exports = Stock;

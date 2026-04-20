const db = require('../config/db');

const Stock = {
  findByProducto: async (id_producto) => {
    const [rows] = await db.query(
      `SELECT s.*, b.nombre AS bodega
       FROM stock s
       JOIN bodegas b ON s.id_bodega = b.id_bodega
       WHERE s.id_producto = ?`,
      [id_producto]
    );
    return rows;
  },

  findByBodega: async (id_bodega) => {
    const [rows] = await db.query(
      `SELECT s.*, p.nombre AS producto, p.codigo_producto
       FROM stock s
       JOIN productos p ON s.id_producto = p.id_producto
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
};

module.exports = Stock;

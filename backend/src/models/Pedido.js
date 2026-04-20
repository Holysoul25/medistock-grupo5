const db = require('../config/db');

const Pedido = {
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT p.*, u.nombre AS cliente
       FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id_usuario
       ORDER BY p.fecha_pedido DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.*, u.nombre AS cliente
       FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id_usuario
       WHERE p.id_pedido = ?`,
      [id]
    );
    return rows[0] || null;
  },

  findDetalleByPedido: async (id_pedido) => {
    const [rows] = await db.query(
      `SELECT dp.*, pr.nombre AS producto, pr.codigo_producto
       FROM detalle_pedido dp
       JOIN productos pr ON dp.id_producto = pr.id_producto
       WHERE dp.id_pedido = ?`,
      [id_pedido]
    );
    return rows;
  },

  create: async (pedido, detalles) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id_usuario, tipo_despacho, direccion_despacho } = pedido;
      const [result] = await conn.query(
        `INSERT INTO pedidos (id_usuario, estado, tipo_despacho, direccion_despacho)
         VALUES (?, 'pendiente', ?, ?)`,
        [id_usuario, tipo_despacho, direccion_despacho]
      );
      const id_pedido = result.insertId;

      for (const item of detalles) {
        await conn.query(
          'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [id_pedido, item.id_producto, item.cantidad, item.precio_unitario]
        );
      }

      await conn.commit();
      return id_pedido;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  updateEstado: async (id, estado) => {
    const estadosValidos = ['pendiente', 'aprobado', 'en_despacho', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) throw new Error('Estado inválido');
    const [result] = await db.query('UPDATE pedidos SET estado = ? WHERE id_pedido = ?', [estado, id]);
    return result.affectedRows;
  },
};

module.exports = Pedido;

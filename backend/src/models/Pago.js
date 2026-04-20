const db = require('../config/db');

const Pago = {
  create: async (pago) => {
    const { id_pedido, monto, metodo_pago, estado, token_transaccion } = pago;
    const [result] = await db.query(
      'INSERT INTO pagos (id_pedido, monto, metodo_pago, estado, token_transaccion) VALUES (?, ?, ?, ?, ?)',
      [id_pedido, monto, metodo_pago, estado, token_transaccion]
    );
    return result.insertId;
  },

  findByPedido: async (id_pedido) => {
    const [rows] = await db.query('SELECT * FROM pagos WHERE id_pedido = ?', [id_pedido]);
    return rows[0] || null;
  },

  updateEstado: async (id_pago, estado) => {
    const [result] = await db.query('UPDATE pagos SET estado = ? WHERE id_pago = ?', [estado, id_pago]);
    return result.affectedRows;
  },
};

module.exports = Pago;

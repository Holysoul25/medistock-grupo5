const db = require('../config/db');

const Pago = {
  findMetodoPagoByNombre: async (nombre) => {
    const [rows] = await db.query('SELECT id_metodo_pago FROM metodo_pago WHERE nombre = ?', [nombre]);
    return rows[0] || null;
  },

  findEstadoPagoByNombre: async (nombre) => {
    const [rows] = await db.query('SELECT id_estado_pago FROM estado_pago WHERE nombre = ?', [nombre]);
    return rows[0] || null;
  },

  create: async (pago) => {
    const { id_pedido, id_metodo_pago, id_estado_pago, monto, referencia_externa, respuesta_gateway = null } = pago;
    const [result] = await db.query(
      `INSERT INTO pago (id_pedido, id_metodo_pago, id_estado_pago, monto, referencia_externa, respuesta_gateway)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_pedido, id_metodo_pago, id_estado_pago, monto, referencia_externa, JSON.stringify(respuesta_gateway)]
    );
    return result.insertId;
  },

  findByPedido: async (id_pedido) => {
    const [rows] = await db.query(
      `SELECT pg.id_pago, pg.monto, pg.referencia_externa, pg.fecha_pago,
              mp.nombre AS metodo_pago, ep.nombre AS estado_pago
       FROM pago pg
       JOIN metodo_pago mp ON pg.id_metodo_pago = mp.id_metodo_pago
       JOIN estado_pago ep ON pg.id_estado_pago = ep.id_estado_pago
       WHERE pg.id_pedido = ?`,
      [id_pedido]
    );
    return rows[0] || null;
  },

  // Busca por token de Webpay (referencia_externa)
  findByToken: async (token) => {
    const [rows] = await db.query(
      `SELECT pg.id_pago, pg.id_pedido, pg.monto, pg.referencia_externa,
              mp.nombre AS metodo_pago, ep.nombre AS estado_pago
       FROM pago pg
       JOIN metodo_pago mp ON pg.id_metodo_pago = mp.id_metodo_pago
       JOIN estado_pago ep ON pg.id_estado_pago = ep.id_estado_pago
       WHERE pg.referencia_externa = ?`,
      [token]
    );
    return rows[0] || null;
  },

  // Actualiza estado y guarda la respuesta completa del gateway
  updateEstadoConRespuesta: async (id_pago, nombreEstado, respuesta_gateway) => {
    const [estadoRows] = await db.query('SELECT id_estado_pago FROM estado_pago WHERE nombre = ?', [nombreEstado]);
    if (!estadoRows[0]) throw { statusCode: 400, message: 'Estado de pago inválido' };
    await db.query(
      'UPDATE pago SET id_estado_pago = ?, respuesta_gateway = ? WHERE id_pago = ?',
      [estadoRows[0].id_estado_pago, JSON.stringify(respuesta_gateway), id_pago]
    );
  },
};

module.exports = Pago;

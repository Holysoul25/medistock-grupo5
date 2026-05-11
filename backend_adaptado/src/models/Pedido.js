const db = require('../config/db');

const Pedido = {
  /**
   * Obtiene id_estado_pedido a partir del nombre del estado
   */
  findEstadoByNombre: async (nombreEstado) => {
    const [rows] = await db.query(
      'SELECT id_estado_pedido FROM estado_pedido WHERE nombre = ?',
      [nombreEstado]
    );
    return rows[0] || null;
  },

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT p.id_pedido, p.fecha_pedido, p.total, p.subtotal, p.descuento,
              p.direccion_entrega, ep.nombre AS estado,
              u.nombre AS ejecutivo,
              cl.id_cliente, uc.nombre AS cliente
       FROM pedido p
       JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
       JOIN usuario u ON p.id_usuario = u.id_usuario
       JOIN cliente cl ON p.id_cliente = cl.id_cliente
       JOIN usuario uc ON cl.id_usuario = uc.id_usuario
       ORDER BY p.fecha_pedido DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.id_pedido, p.fecha_pedido, p.total, p.subtotal, p.descuento,
              p.direccion_entrega, p.comuna, p.notas, ep.nombre AS estado,
              u.nombre AS ejecutivo,
              cl.id_cliente, uc.nombre AS cliente, uc.email AS cliente_email
       FROM pedido p
       JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
       JOIN usuario u ON p.id_usuario = u.id_usuario
       JOIN cliente cl ON p.id_cliente = cl.id_cliente
       JOIN usuario uc ON cl.id_usuario = uc.id_usuario
       WHERE p.id_pedido = ?`,
      [id]
    );
    return rows[0] || null;
  },

   findByUsuario: async (id_usuario) => {
    const [rows] = await db.query(
      `SELECT p.id_pedido, p.fecha_pedido, p.total, p.subtotal, p.descuento,
              p.direccion_entrega, ep.nombre AS estado,
              u.nombre AS ejecutivo,
              cl.id_cliente, uc.nombre AS cliente
       FROM pedido p
       JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
       JOIN usuario u ON p.id_usuario = u.id_usuario
       JOIN cliente cl ON p.id_cliente = cl.id_cliente
       JOIN usuario uc ON cl.id_usuario = uc.id_usuario
       WHERE cl.id_usuario = ?
       ORDER BY p.fecha_pedido DESC`,
      [id_usuario]
    );
    return rows;
  },


  findDetalleByPedido: async (id_pedido) => {
    const [rows] = await db.query(
      `SELECT dp.id_detalle_pedido, dp.cantidad, dp.precio_unitario, dp.subtotal,
              pr.id_producto, pr.nombre AS producto, pr.codigo_producto
       FROM detalle_pedido dp
       JOIN producto pr ON dp.id_producto = pr.id_producto
       WHERE dp.id_pedido = ?`,
      [id_pedido]
    );
    return rows;
  },

  /**
   * Crea pedido + detalles en una transacción atómica
   * detalles: [{ id_producto, cantidad, precio_unitario }]
   */
  create: async (pedido, detalles) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id_cliente, id_usuario, id_estado_pedido, direccion_entrega = null,comuna =null, notas = null } = pedido;

      // Calcular totales
      const subtotal = detalles.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);
      const total = subtotal; // sin descuento por defecto

      const [result] = await conn.query(
        `INSERT INTO pedido (id_cliente, id_usuario, id_estado_pedido, direccion_entrega,comuna, subtotal, total, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_cliente, id_usuario, id_estado_pedido, direccion_entrega,comuna, subtotal, total, notas]
      );
      const id_pedido = result.insertId;

      for (const item of detalles) {
        const subtotalItem = item.cantidad * item.precio_unitario;
        await conn.query(
          `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [id_pedido, item.id_producto, item.cantidad, item.precio_unitario, subtotalItem]
        );
      }

      // Registrar en historial
      await conn.query(
        `INSERT INTO historial_pedido (id_pedido, id_usuario, id_estado_pedido, observacion)
         VALUES (?, ?, ?, 'Pedido creado')`,
        [id_pedido, id_usuario, id_estado_pedido]
      );

      await conn.commit();
      return id_pedido;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  updateEstado: async (id_pedido, nombreEstado, id_usuario) => {
    const estadosValidos = ['pendiente', 'aprobado', 'despachado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(nombreEstado)) {
      throw { statusCode: 400, message: `Estado inválido. Válidos: ${estadosValidos.join(', ')}` };
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [estadoRows] = await conn.query(
        'SELECT id_estado_pedido FROM estado_pedido WHERE nombre = ?',
        [nombreEstado]
      );
      if (!estadoRows[0]) throw { statusCode: 400, message: 'Estado no encontrado en la base de datos' };
      const id_estado_pedido = estadoRows[0].id_estado_pedido;

      await conn.query(
        'UPDATE pedido SET id_estado_pedido = ? WHERE id_pedido = ?',
        [id_estado_pedido, id_pedido]
      );

      await conn.query(
        `INSERT INTO historial_pedido (id_pedido, id_usuario, id_estado_pedido)
         VALUES (?, ?, ?)`,
        [id_pedido, id_usuario, id_estado_pedido]
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

findByUsuario: async (id_usuario) => {
  const [rows] = await db.query(
    `SELECT p.id_pedido, p.fecha_pedido, p.total, p.subtotal, p.descuento,
            p.direccion_entrega, ep.nombre AS estado,
            u.nombre AS ejecutivo,
            cl.id_cliente, uc.nombre AS cliente
     FROM pedido p
     JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
     JOIN usuario u ON p.id_usuario = u.id_usuario
     JOIN cliente cl ON p.id_cliente = cl.id_cliente
     JOIN usuario uc ON cl.id_usuario = uc.id_usuario
     WHERE cl.id_usuario = ?
     ORDER BY p.fecha_pedido DESC`,
    [id_usuario]
  );
  return rows;
},

module.exports = Pedido;

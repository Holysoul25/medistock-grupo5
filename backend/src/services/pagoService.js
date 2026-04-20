const Pago = require('../models/Pago');
const Pedido = require('../models/Pedido');

/**
 * En producción, aquí se integra con Webpay o MercadoPago.
 * Por ahora simula la respuesta de la pasarela externa.
 */
const procesarPago = async (id_pedido, metodo_pago) => {
  const pedido = await Pedido.findById(id_pedido);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  if (pedido.estado !== 'pendiente') throw { statusCode: 400, message: 'El pedido no está en estado pendiente' };

  // Simular integración externa (reemplazar con SDK real)
  const token_transaccion = `TXN-${Date.now()}`;
  const estadoPago = 'aprobado'; // En producción: resultado real de la pasarela

  const id_pago = await Pago.create({
    id_pedido,
    monto: pedido.total || 0,
    metodo_pago,
    estado: estadoPago,
    token_transaccion,
  });

  if (estadoPago === 'aprobado') {
    await Pedido.updateEstado(id_pedido, 'aprobado');
  }

  return { id_pago, estado: estadoPago, token_transaccion };
};

module.exports = { procesarPago };

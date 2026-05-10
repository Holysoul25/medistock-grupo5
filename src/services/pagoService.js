const Pago = require('../models/Pago');
const Pedido = require('../models/Pedido');
const webpay = require('../integrations/webpay');

/**
 * PASO 1: Inicia la transacción en Webpay.
 * Retorna una URL donde el cliente debe completar el pago.
 * El frontend debe redirigir al usuario a esa URL.
 */
const iniciarPago = async (id_pedido, id_usuario, returnUrl) => {
  const pedido = await Pedido.findById(id_pedido);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  if (pedido.estado !== 'pendiente') {
    throw { statusCode: 400, message: `El pedido debe estar en estado "pendiente" (actual: ${pedido.estado})` };
  }

  // Verificar que no tenga ya un pago iniciado
  const pagoExistente = await Pago.findByPedido(id_pedido);
  if (pagoExistente) throw { statusCode: 409, message: 'Este pedido ya tiene un pago registrado' };

  const buyOrder  = `PEDIDO-${id_pedido}`;
  const sessionId = `USER-${id_usuario}`;
  const amount    = Math.round(pedido.total); // Webpay requiere entero

  const { token, url_pago } = await webpay.iniciarTransaccion(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  );

  // Guardar token pendiente para confirmar después
  const metodoPagoRow = await Pago.findMetodoPagoByNombre('tarjeta_credito');
  const estadoPendienteRow = await Pago.findEstadoPagoByNombre('pendiente');

  await Pago.create({
    id_pedido,
    id_metodo_pago: metodoPagoRow.id_metodo_pago,
    id_estado_pago: estadoPendienteRow.id_estado_pago,
    monto: pedido.total,
    referencia_externa: token,
    respuesta_gateway: { token, buy_order: buyOrder, session_id: sessionId },
  });

  return {
    token,
    url_pago,
    mensaje: 'Redirige al usuario a url_pago para completar el pago',
  };
};

/**
 * PASO 2: Webpay redirige al returnUrl con el token.
 * Este endpoint confirma la transacción y actualiza el estado del pedido.
 */
const confirmarPago = async (token_ws, id_usuario) => {
  if (!token_ws) throw { statusCode: 400, message: 'token_ws es requerido' };

  const resultado = await webpay.confirmarTransaccion(token_ws);

  // Buscar el pago por la referencia externa (token)
  const pago = await Pago.findByToken(token_ws);
  if (!pago) throw { statusCode: 404, message: 'Pago no encontrado para este token' };

  const aprobado = resultado.response_code === 0 && resultado.status === 'AUTHORIZED';
  const nuevoEstadoPago = aprobado ? 'aprobado' : 'rechazado';

  await Pago.updateEstadoConRespuesta(pago.id_pago, nuevoEstadoPago, resultado);

  if (aprobado) {
    await Pedido.updateEstado(pago.id_pedido, 'aprobado', id_usuario);
  }

  return {
    aprobado,
    estado_pago: nuevoEstadoPago,
    monto: resultado.amount,
    codigo_autorizacion: resultado.authorization_code,
    tipo_pago: resultado.payment_type_code,
    fecha: resultado.transaction_date,
    buy_order: resultado.buy_order,
  };
};

module.exports = { iniciarPago, confirmarPago };

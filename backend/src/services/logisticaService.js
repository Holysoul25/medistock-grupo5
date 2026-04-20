const Pedido = require('../models/Pedido');

/**
 * En producción, se integra con API del courier (Chilexpress, Starken, etc.).
 * Por ahora simula la generación del tracking.
 */
const generarEnvio = async (id_pedido) => {
  const pedido = await Pedido.findById(id_pedido);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  if (pedido.estado !== 'aprobado') throw { statusCode: 400, message: 'El pedido debe estar aprobado para despachar' };

  // Simular respuesta del courier externo
  const codigo_tracking = `MSTK-${Date.now()}`;

  await Pedido.updateEstado(id_pedido, 'en_despacho');

  return { id_pedido, codigo_tracking, estado_despacho: 'generado', mensaje: 'Orden de envío creada' };
};

const consultarTracking = async (codigo_tracking) => {
  // Simular consulta al courier externo
  return {
    codigo_tracking,
    estado: 'en_camino',
    ubicacion: 'Centro de distribución Santiago',
    ultima_actualizacion: new Date().toISOString(),
  };
};

module.exports = { generarEnvio, consultarTracking };

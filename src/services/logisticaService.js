const Pedido = require('../models/Pedido');
const bluexpress = require('../integrations/bluexpress');

/**
 * Genera una orden de envío en Bluexpress y actualiza el estado del pedido
 */
const generarEnvio = async (id_pedido, id_usuario, datosEnvio = {}) => {
  const pedido = await Pedido.findById(id_pedido);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  if (pedido.estado !== 'aprobado') {
    throw { statusCode: 400, message: `El pedido debe estar "aprobado" para despachar (actual: ${pedido.estado})` };
  }

  const ordenBluexpress = await bluexpress.generarOrdenEnvio({
    numero_pedido: `MEDISTOCK-${id_pedido}`,
    nombre_destinatario: datosEnvio.nombre_destinatario || pedido.cliente || 'Cliente MEDISTOCK',
    direccion: datosEnvio.direccion || pedido.direccion_entrega || 'Sin dirección',
    ciudad: datosEnvio.ciudad || 'Santiago',
    telefono: datosEnvio.telefono || '',
    peso_kg: datosEnvio.peso_kg || 1,
    descripcion: `Pedido MEDISTOCK #${id_pedido}`,
  });

  // Actualizar estado del pedido a despachado
  await Pedido.updateEstado(id_pedido, 'despachado', id_usuario);

  return {
    id_pedido,
    codigo_seguimiento: ordenBluexpress.codigo_seguimiento,
    numero_orden_bluexpress: ordenBluexpress.numero_orden,
    estado_despacho: ordenBluexpress.estado,
    fecha_estimada_entrega: ordenBluexpress.fecha_estimada_entrega,
    etiqueta_url: ordenBluexpress.etiqueta_url,
    proveedor: 'Bluexpress',
    mensaje: ordenBluexpress.mensaje || 'Envío generado correctamente',
  };
};

/**
 * Consulta el estado de un envío por código de seguimiento Bluexpress
 */
const consultarTracking = async (codigo_seguimiento) => {
  const resultado = await bluexpress.consultarTracking(codigo_seguimiento);
  return resultado;
};

module.exports = { generarEnvio, consultarTracking };

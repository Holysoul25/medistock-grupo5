const Pedido = require('../models/Pedido');
const shipit = require('../integrations/shipitClient');

/**
 * Genera una orden de envío en Shipit.cl y actualiza el estado del pedido
 */
const generarEnvio = async (id_pedido, id_usuario, datosEnvio = {}) => {
  const pedido = await Pedido.findById(id_pedido);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  if (pedido.estado !== 'aprobado') {
    throw { statusCode: 400, message: `El pedido debe estar "aprobado" para despachar (actual: ${pedido.estado})` };
  }

  const ordenShipit = await shipit.generarOrdenEnvio({
    numero_pedido: String(id_pedido),
    nombre_destinatario: datosEnvio.nombre_destinatario || pedido.cliente || 'Cliente MEDISTOCK',
    direccion: datosEnvio.direccion || pedido.direccion_entrega || 'Sin dirección',
    ciudad: pedido.comuna || datosEnvio.ciudad || 'Santiago', // ← usa comuna del pedido
    telefono: datosEnvio.telefono || '',
    peso_kg: datosEnvio.peso_kg || 1,
    descripcion: `Pedido MEDISTOCK #${id_pedido}`,
  });

  // Actualizar estado del pedido a despachado
  await Pedido.updateEstado(id_pedido, 'despachado', id_usuario);

  return {
    id_pedido,
    codigo_seguimiento: ordenShipit.codigo_seguimiento,
    numero_orden_shipit: ordenShipit.numero_orden,
    estado_despacho: ordenShipit.estado,
    fecha_estimada_entrega: ordenShipit.fecha_estimada_entrega,
    etiqueta_url: ordenShipit.etiqueta_url,
    proveedor: 'Shipit.cl',
    mensaje: ordenShipit.mensaje || 'Envío generado correctamente',
  };
};

/**
 * Consulta el estado de un envío por código de seguimiento Shipit.cl
 */
const consultarTracking = async (codigo_seguimiento) => {
  const resultado = await shipit.consultarTracking(codigo_seguimiento);
  return resultado;
};

module.exports = { generarEnvio, consultarTracking };
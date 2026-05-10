const logisticaService = require('../services/logisticaService');
const { success } = require('../utils/response');

/**
 * POST /api/v1/logistica/:id_pedido/envio
 * Genera orden de envío en Bluexpress
 */
const generarEnvio = async (req, res, next) => {
  try {
    const datosEnvio = {
      nombre_destinatario: req.body.nombre_destinatario,
      direccion: req.body.direccion,
      ciudad: req.body.ciudad,
      telefono: req.body.telefono,
      peso_kg: req.body.peso_kg,
    };
    const resultado = await logisticaService.generarEnvio(req.params.id_pedido, req.user.id, datosEnvio);
    success(res, resultado, 'Envío generado en Bluexpress', 201);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/logistica/tracking/:codigo
 * Consulta estado del envío en Bluexpress
 */
const consultarTracking = async (req, res, next) => {
  try {
    const resultado = await logisticaService.consultarTracking(req.params.codigo);
    success(res, resultado);
  } catch (err) { next(err); }
};

module.exports = { generarEnvio, consultarTracking };

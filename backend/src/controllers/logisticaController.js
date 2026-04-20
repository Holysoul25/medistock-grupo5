const logisticaService = require('../services/logisticaService');
const { success } = require('../utils/response');

const generarEnvio = async (req, res, next) => {
  try {
    const resultado = await logisticaService.generarEnvio(req.params.id_pedido);
    success(res, resultado, 'Envío generado', 201);
  } catch (err) { next(err); }
};

const consultarTracking = async (req, res, next) => {
  try {
    const resultado = await logisticaService.consultarTracking(req.params.codigo);
    success(res, resultado);
  } catch (err) { next(err); }
};

module.exports = { generarEnvio, consultarTracking };

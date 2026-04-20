const pagoService = require('../services/pagoService');
const { success } = require('../utils/response');

const procesarPago = async (req, res, next) => {
  try {
    const resultado = await pagoService.procesarPago(req.params.id_pedido, req.body.metodo_pago);
    success(res, resultado, 'Pago procesado');
  } catch (err) { next(err); }
};

module.exports = { procesarPago };

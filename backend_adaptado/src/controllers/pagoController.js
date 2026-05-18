const pagoService = require('../services/pagoService');
const { success } = require('../utils/response');

/**
 * POST /api/v1/pagos/:id_pedido/iniciar
 * Inicia la transacción Webpay y retorna la URL de pago
 */
const iniciarPago = async (req, res, next) => {
  try {
    // returnUrl es la URL del frontend que recibirá el token tras el pago
    const returnUrl = req.body.return_url || `${process.env.FRONTEND_URL || 'http://localhost:4200'}/pago/confirmar`;
    const resultado = await pagoService.iniciarPago(req.params.id_pedido, req.user.id, returnUrl);
    success(res, resultado, 'Transacción iniciada. Redirigir al usuario a url_pago', 201);
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/pagos/confirmar
 * Webpay redirige aquí con token_ws después del pago
 * También puede llamarse manualmente desde Postman para confirmar
 */
const confirmarPago = async (req, res, next) => {
  try {
    // Webpay envía token_ws por GET o POST según la versión
    const token_ws = req.body.token_ws || req.query.token_ws;
    const resultado = await pagoService.confirmarPago(token_ws, req.user.id);
    success(res, resultado, resultado.aprobado ? 'Pago aprobado' : 'Pago rechazado');
  } catch (err) { next(err); }
};

module.exports = { iniciarPago, confirmarPago };

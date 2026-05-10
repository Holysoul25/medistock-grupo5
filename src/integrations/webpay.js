const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } = require('transbank-sdk');

/**
 * Configuración Webpay Plus
 * En producción: reemplazar por Environment.Production y credenciales reales
 */
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,   // 597055555532
    IntegrationApiKeys.WEBPAY,              // clave pública de integración
    Environment.Integration                  // apunta a sandbox de Transbank
  )
);

/**
 * Inicia una transacción Webpay Plus
 * @param {string} buyOrder   - ID único del pedido (ej: "PEDIDO-42")
 * @param {string} sessionId  - ID de sesión del usuario
 * @param {number} amount     - Monto en pesos chilenos (entero)
 * @param {string} returnUrl  - URL a la que Webpay redirige tras el pago
 * @returns {{ token, url }} - Token y URL del formulario de pago de Transbank
 */
const iniciarTransaccion = async (buyOrder, sessionId, amount, returnUrl) => {
  const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
  return {
    token: response.token,
    url_pago: response.url,  // URL donde el usuario completa el pago
  };
};

/**
 * Confirma una transacción después de que Webpay redirige al returnUrl
 * @param {string} token - Token recibido por GET/POST en el returnUrl
 * @returns {object} - Resultado completo de la transacción
 */
const confirmarTransaccion = async (token) => {
  const response = await tx.commit(token);
  return {
    buy_order: response.buy_order,
    session_id: response.session_id,
    amount: response.amount,
    status: response.status,           // AUTHORIZED | FAILED
    authorization_code: response.authorization_code,
    payment_type_code: response.payment_type_code,
    response_code: response.response_code, // 0 = aprobado
    transaction_date: response.transaction_date,
    raw: response,                     // respuesta completa para auditoría
  };
};

module.exports = { iniciarTransaccion, confirmarTransaccion };

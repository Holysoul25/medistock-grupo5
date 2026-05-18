const axios = require('axios');

const getDolar = async () => {
  const res = await axios.get('https://mindicador.cl/api/dolar');
  const valor = res.data?.serie?.[0]?.valor;
  if (!valor) throw { statusCode: 502, message: 'No se pudo obtener el tipo de cambio' };
  return { moneda: 'USD', valor_clp: valor, fecha: res.data?.serie?.[0]?.fecha };
};

const convertirCLPaUSD = async (monto_clp) => {
  const { valor_clp, fecha } = await getDolar();
  const monto_usd = (monto_clp / valor_clp).toFixed(2);
  return { monto_clp, monto_usd: parseFloat(monto_usd), tasa: valor_clp, fecha };
};

module.exports = { getDolar, convertirCLPaUSD };
const divisaService = require('../services/divisaService');

const getDolar = async (req, res) => {
  try {
    const data = await divisaService.getDolar();
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const convertir = async (req, res) => {
  try {
    const { monto } = req.query;
    if (!monto || isNaN(monto)) {
      return res.status(400).json({ success: false, message: 'Monto inválido' });
    }
    const data = await divisaService.convertirCLPaUSD(parseFloat(monto));
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = { getDolar, convertir };
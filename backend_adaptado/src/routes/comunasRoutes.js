// routes/comunasRoutes.js
const express = require('express');
const router = express.Router();
const shipitClient = require('../integrations/shipitClient');

router.get('/', async (req, res) => {
  try {
    const comunas = await shipitClient.getComunas();
    res.json({ success: true, data: comunas });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener comunas' });
  }
});

module.exports = router;
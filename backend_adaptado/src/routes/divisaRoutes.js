const express = require('express');
const router = express.Router();
const divisaController = require('../controllers/divisaController');

router.get('/dolar', divisaController.getDolar);
router.get('/convertir', divisaController.convertir);

module.exports = router;
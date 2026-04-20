const router = require('express').Router();
const ctrl = require('../controllers/pagoController');
const auth = require('../middlewares/auth');

router.post('/:id_pedido/procesar', auth, ctrl.procesarPago);

module.exports = router;

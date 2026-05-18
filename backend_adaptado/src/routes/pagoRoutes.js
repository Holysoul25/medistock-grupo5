const router = require('express').Router();
const ctrl = require('../controllers/pagoController');
const auth = require('../middlewares/auth');

// Inicia transacción Webpay (retorna URL de pago)
router.post('/:id_pedido/iniciar', auth, ctrl.iniciarPago);

// Confirma transacción (Webpay redirige aquí con token_ws)
router.post('/confirmar', auth, ctrl.confirmarPago);

module.exports = router;
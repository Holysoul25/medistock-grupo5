const router = require('express').Router();
const ctrl = require('../controllers/logisticaController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/validateRole');

router.post('/:id_pedido/envio', auth, authorize('admin', 'operador'), ctrl.generarEnvio);
router.get('/tracking/:codigo', auth, ctrl.consultarTracking);

module.exports = router;

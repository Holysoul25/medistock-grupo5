const router = require('express').Router();
const ctrl = require('../controllers/pedidoController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/validateRole');

router.get('/', auth, authorize('admin', 'ejecutivo', 'operador', 'analista'), ctrl.getAll);
router.get('/:id', auth, ctrl.getById);
router.post('/', auth, ctrl.create);
router.patch('/:id/estado', auth, authorize('admin', 'ejecutivo', 'operador'), ctrl.updateEstado);

module.exports = router;

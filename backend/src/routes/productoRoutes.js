const router = require('express').Router();
const ctrl = require('../controllers/productoController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/validateRole');

// Públicos (con token)
router.get('/', auth, ctrl.getAll);
router.get('/:codigo_producto', auth, ctrl.getByCodigo);

// Solo admin/ejecutivo pueden crear, editar o eliminar
router.post('/', auth, authorize('admin', 'ejecutivo'), ctrl.create);
router.put('/:id', auth, authorize('admin', 'ejecutivo'), ctrl.update);
router.delete('/:id', auth, authorize('admin'), ctrl.remove);

module.exports = router;

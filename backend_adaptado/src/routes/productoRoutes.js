const router = require('express').Router();
const ctrl = require('../controllers/productoController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/validateRole');


// Públicos — sin token (catálogo visible para cualquier visitante)
router.get('/', ctrl.getAll);
router.get('/:codigo_producto', ctrl.getByCodigo);

// Solo admin/ejecutivo pueden crear, editar o eliminar
router.post('/', auth, authorize('admin', 'ejecutivo'), ctrl.create);
router.put('/:id', auth, authorize('admin', 'ejecutivo'), ctrl.update);
router.delete('/:id', auth, authorize('admin'), ctrl.remove);
router.patch('/:id/reactivar', auth, authorize('admin','ejecutivo'), ctrl.reactivar);

module.exports = router;
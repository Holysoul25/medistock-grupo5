const router = require('express').Router();
const ctrl = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole'); // asegúrate de tener este middleware

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        auth, ctrl.getProfile);

// ── CRUD admin ──────────────────────────────────────
router.get('/',        auth, requireRole('admin'), ctrl.getAll);
router.get('/:id',     auth, requireRole('admin'), ctrl.getById);
router.put('/:id',     auth, requireRole('admin'), ctrl.update);
router.delete('/:id',  auth, requireRole('admin'), ctrl.remove);

module.exports = router;
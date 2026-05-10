const router = require('express').Router();
const ctrl = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', auth, ctrl.getProfile);

module.exports = router;

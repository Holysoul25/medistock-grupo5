const router = require('express').Router();

router.use('/productos', require('./productoRoutes'));
router.use('/usuarios', require('./usuarioRoutes'));
router.use('/pedidos', require('./pedidoRoutes'));
router.use('/pagos', require('./pagoRoutes'));
router.use('/logistica', require('./logisticaRoutes'));
router.use('/comunas', require('./comunasRoutes'));
router.use('/divisas', require('./divisaRoutes'));

module.exports = router;
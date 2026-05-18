const pedidoService = require('../services/pedidoService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const pedidos = await pedidoService.getAll();
    success(res, pedidos);
  } catch (err) { next(err); }
};

const getMisPedidos = async (req, res, next) => {
  try {
    const pedidos = await pedidoService.getMisPedidos(req.user.id);
    success(res, pedidos);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const pedido = await pedidoService.getById(req.params.id);
    success(res, pedido);
  } catch (err) { next(err); }
};



const create = async (req, res, next) => {
  try {
    const pedido = await pedidoService.create(req.user.id, req.body);
    success(res, pedido, 'Pedido creado', 201);
  } catch (err) { next(err); }
};

const updateEstado = async (req, res, next) => {
  try {
    // Pasamos id_usuario para registrar en historial_pedido
    const pedido = await pedidoService.updateEstado(req.params.id, req.body.estado, req.user.id);
    success(res, pedido, 'Estado actualizado');
  } catch (err) { next(err); }
};

module.exports = { getAll, getMisPedidos, getById, create, updateEstado };

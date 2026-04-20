const productoService = require('../services/productoService');
const { success, error } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const productos = await productoService.getAll();
    success(res, productos, 'Productos obtenidos correctamente');
  } catch (err) { next(err); }
};

const getByCodigo = async (req, res, next) => {
  try {
    const producto = await productoService.getByCodigo(req.params.codigo_producto);
    success(res, producto);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const producto = await productoService.create(req.body);
    success(res, producto, 'Producto creado', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const producto = await productoService.update(req.params.id, req.body);
    success(res, producto, 'Producto actualizado');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await productoService.remove(req.params.id);
    success(res, null, 'Producto eliminado');
  } catch (err) { next(err); }
};

module.exports = { getAll, getByCodigo, create, update, remove };

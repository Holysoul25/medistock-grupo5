const Producto = require('../models/Producto');
const Stock = require('../models/Stock');

const getAll = async () => {
  return await Producto.findAll();
};

const getByCodigo = async (codigo) => {
  const producto = await Producto.findByCodigo(codigo);
  if (!producto) throw { statusCode: 404, message: `Producto con código ${codigo} no encontrado` };
  const stock = await Stock.findByProducto(producto.id_producto);
  return { ...producto, stock };
};

const create = async (data) => {
  const existente = await Producto.findByCodigo(data.codigo_producto);
  if (existente) throw { statusCode: 409, message: 'Ya existe un producto con ese código' };
  const id = await Producto.create(data);
  return { id_producto: id, ...data };
};

const update = async (id, data) => {
  const producto = await Producto.findById(id);
  if (!producto) throw { statusCode: 404, message: 'Producto no encontrado' };
  await Producto.update(id, data);
  return await Producto.findById(id);
};

const remove = async (id) => {
  const producto = await Producto.findById(id);
  if (!producto) throw { statusCode: 404, message: 'Producto no encontrado' };
  await Producto.softDelete(id);
};

module.exports = { getAll, getByCodigo, create, update, remove };

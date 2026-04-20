const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

const getAll = async () => {
  return await Pedido.findAll();
};

const getById = async (id) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  const detalle = await Pedido.findDetalleByPedido(id);
  return { ...pedido, detalle };
};

const create = async (id_usuario, body) => {
  const { tipo_despacho, direccion_despacho, items } = body;
  if (!items || items.length === 0) throw { statusCode: 400, message: 'El pedido debe tener al menos un producto' };

  // Validar productos y precios
  const detalles = [];
  for (const item of items) {
    const producto = await Producto.findById(item.id_producto);
    if (!producto) throw { statusCode: 404, message: `Producto ${item.id_producto} no encontrado` };
    detalles.push({ id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario: producto.precio });
  }

  const id = await Pedido.create({ id_usuario, tipo_despacho, direccion_despacho }, detalles);
  return await getById(id);
};

const updateEstado = async (id, estado) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  await Pedido.updateEstado(id, estado);
  return await getById(id);
};

module.exports = { getAll, getById, create, updateEstado };

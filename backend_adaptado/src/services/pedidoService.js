const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

const getAll = async () => {
  return await Pedido.findAll();
};

const getMisPedidos = async (id_usuario) => {
  return await Pedido.findByUsuario(id_usuario);
};

const getById = async (id) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  const detalle = await Pedido.findDetalleByPedido(id);
  return { ...pedido, detalle };
};

const create = async (id_usuario, body) => {
  const { direccion_entrega, comuna, notas, items } = body;

  if (!items || items.length === 0) {
    throw { statusCode: 400, message: 'El pedido debe tener al menos un producto' };
  }

  // Obtener id_cliente a partir del usuario autenticado
  const clienteInfo = await Usuario.findClienteByUsuario(id_usuario);
  if (!clienteInfo) {
    throw { statusCode: 400, message: 'El usuario no tiene un perfil de cliente registrado' };
  }

  // Resolver estado inicial 'pendiente'
  const estadoRow = await Pedido.findEstadoByNombre('pendiente');
  if (!estadoRow) throw { statusCode: 500, message: 'Estado pendiente no encontrado en BD' };

  // Validar productos y construir detalles con precio real de la BD
  const detalles = [];
  for (const item of items) {
    const producto = await Producto.findById(item.id_producto);
    if (!producto) {
      throw { statusCode: 404, message: `Producto con id ${item.id_producto} no encontrado` };
    }
    detalles.push({
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: producto.precio, // viene del alias en el model
    });
  }

  const id_pedido = await Pedido.create(
    {
      id_cliente: clienteInfo.id_cliente,
      id_usuario,
      id_estado_pedido: estadoRow.id_estado_pedido,
      direccion_entrega,
      comuna,
      notas,
    },
    detalles
  );

  return await getById(id_pedido);
};

const updateEstado = async (id, estado, id_usuario) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };
  await Pedido.updateEstado(id, estado, id_usuario);
  return await getById(id);
};

module.exports = { getAll, getMisPedidos, getById, create, updateEstado };

const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const emailService = require('./emailService');

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

  const clienteInfo = await Usuario.findClienteByUsuario(id_usuario);
  if (!clienteInfo) {
    throw { statusCode: 400, message: 'El usuario no tiene un perfil de cliente registrado' };
  }

  const estadoRow = await Pedido.findEstadoByNombre('pendiente');
  if (!estadoRow) throw { statusCode: 500, message: 'Estado pendiente no encontrado en BD' };

  const detalles = [];
  for (const item of items) {
    const producto = await Producto.findById(item.id_producto);
    if (!producto) {
      throw { statusCode: 404, message: `Producto con id ${item.id_producto} no encontrado` };
    }
    detalles.push({
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: producto.precio,
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

  const pedidoCreado = await getById(id_pedido);

  // Email pedido creado
  try {
    const usuario = await Usuario.findById(id_usuario);
    if (usuario?.email) {
      const total = pedidoCreado.total ?? pedidoCreado.subtotal ?? 0;
      await emailService.sendPedidoEmail('pedido_creado', {
        email: usuario.email,
        nombre: usuario.nombre,
        id_pedido,
        total: '$' + parseFloat(total).toLocaleString('es-CL'),
        direccion: direccion_entrega
      });
    }
  } catch (e) {
    console.error('Error enviando email pedido_creado:', e.message);
  }

  return pedidoCreado;
};

const updateEstado = async (id, estado, id_usuario) => {
  const pedido = await Pedido.findById(id);
  if (!pedido) throw { statusCode: 404, message: 'Pedido no encontrado' };

  await Pedido.updateEstado(id, estado, id_usuario);
  const pedidoActualizado = await getById(id);

  // Email por cambio de estado
  const estadoEvento = {
    aprobado:   'pedido_aprobado',
    despachado: 'pedido_despachado',
    entregado:  'pedido_entregado',
    cancelado:  'pedido_cancelado'
  };

  const evento = estadoEvento[estado];
  if (evento) {
    try {
      // Buscar email del cliente del pedido
      const usuario = await Usuario.findById(pedido.id_usuario);
      if (usuario?.email) {
        const total = pedidoActualizado.total ?? pedidoActualizado.subtotal ?? 0;
        await emailService.sendPedidoEmail(evento, {
          email: usuario.email,
          nombre: usuario.nombre,
          id_pedido: id,
          total: '$' + parseFloat(total).toLocaleString('es-CL'),
          direccion: pedido.direccion_entrega,
          codigo_seguimiento: pedidoActualizado.codigo_seguimiento ?? null
        });
      }
    } catch (e) {
      console.error(`Error enviando email [${evento}]:`, e.message);
    }
  }

  return pedidoActualizado;
};

module.exports = { getAll, getMisPedidos, getById, create, updateEstado };
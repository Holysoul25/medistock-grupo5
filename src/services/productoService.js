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

  // Resolver categoría: acepta nombre de categoría como string
  const id_categoria = await Producto.findOrCreateCategoria(data.categoria || 'General');

  const id = await Producto.create({ ...data, id_categoria });
  return await Producto.findById(id);
};

const update = async (id, data) => {
  const producto = await Producto.findById(id);
  if (!producto) throw { statusCode: 404, message: 'Producto no encontrado' };

  const id_categoria = data.categoria
    ? await Producto.findOrCreateCategoria(data.categoria)
    : null;

  await Producto.update(id, {
    nombre: data.nombre ?? producto.nombre,
    descripcion: data.descripcion ?? producto.descripcion,
    precio_unitario: data.precio_unitario ?? data.precio ?? producto.precio,
    id_categoria: id_categoria ?? producto.id_categoria,
    unidad_medida: data.unidad_medida ?? producto.unidad_medida,
    requiere_receta: data.requiere_receta ?? producto.requiere_receta,
  });

  return await Producto.findById(id);
};

const remove = async (id) => {
  const producto = await Producto.findById(id);
  if (!producto) throw { statusCode: 404, message: 'Producto no encontrado' };
  await Producto.softDelete(id);
};

module.exports = { getAll, getByCodigo, create, update, remove };

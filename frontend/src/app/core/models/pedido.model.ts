export type EstadoPedido = 'pendiente'|'aprobado'|'despachado'|'entregado'|'cancelado';

export interface Pedido {
  id_pedido: number;
  fecha_pedido: string;
  total: number;
  subtotal: number;
  descuento?: number;
  direccion_entrega?: string;
  notas?: string;
  estado: EstadoPedido;
  ejecutivo?: string;
  cliente?: string;
  cliente_email?: string;
  id_cliente?: number;
  detalle?: DetallePedido[];
}

export interface DetallePedido {
  id_detalle_pedido: number;
  producto: string;
  codigo_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ItemPedido { id_producto: number; cantidad: number; }

export interface NuevoPedidoRequest {
  direccion_entrega?: string;
  notas?: string;
  items: ItemPedido[];
}

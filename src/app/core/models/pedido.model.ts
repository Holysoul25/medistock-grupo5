
export type EstadoPedido = 'pendiente' | 'aprobado' | 'despachado' | 'entregado' | 'cancelado';

export interface Pedido {
  id_pedido: number;
  fecha_pedido: string;
  total: string;
  subtotal: string;
  descuento: string;
  direccion_entrega: string;
  comuna?: string | null;
  notas?: string | null;
  estado: EstadoPedido;
  ejecutivo: string;
  id_cliente: number;
  cliente: string;
  cliente_email: string;
  detalle?: any[];

  // Despacho (LEFT JOIN desde tabla despacho)
  id_despacho?: number | null;
  codigo_seguimiento?: string | null;
  fecha_entrega_real?: string | null;
  fecha_estimada_entrega?: string | null;  // ← agrega este
  estado_despacho?: string | null;
  proveedor_logistica?: string | null;
  etiqueta_url?: string | null;            // ← y este
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
  direccion_entrega: string;
  comuna: string;
  notas?: string;
  items: ItemPedido[];
}
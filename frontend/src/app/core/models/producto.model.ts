export interface Producto {
  id_producto: number;
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  unidad_medida: string;
  requiere_receta: boolean | number;
  activo?: number;
  stock?: StockInfo[];
}

export interface StockInfo {
  id_stock: number;
  cantidad: number;
  stock_minimo: number;
  bodega: string;
}

export interface ProductoForm {
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  precio_unitario: number;
  categoria: string;
  unidad_medida: string;
  requiere_receta: number;
}

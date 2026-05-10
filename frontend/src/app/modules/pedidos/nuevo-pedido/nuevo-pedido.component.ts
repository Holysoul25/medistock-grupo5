import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto } from '../../../core/models/producto.model';
import { ItemPedido } from '../../../core/models/pedido.model';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrl: './nuevo-pedido.component.scss'
})
export class NuevoPedidoComponent implements OnInit {
  productos: Producto[] = [];
  filtrados: Producto[] = [];
  carrito: ItemCarrito[] = [];
  searchTerm = '';
  direccion_entrega = '';
  notas = '';
  loading = false;
  loadingProductos = true;

  constructor(
    private productoSvc: ProductoService,
    private pedidoSvc: PedidoService,
    private toastSvc: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoSvc.getAll().subscribe({
      next: (res: any) => {
        this.productos = res.data ?? res ?? [];
        this.filtrados = [...this.productos];
        this.loadingProductos = false;
      },
      error: () => { this.loadingProductos = false; }
    });
  }

  filtrar(): void {
    const q = this.searchTerm.toLowerCase();
    this.filtrados = q
      ? this.productos.filter(p =>
          p.nombre.toLowerCase().includes(q) ||
          (p.codigo_producto || '').toLowerCase().includes(q) ||
          (p.categoria || '').toLowerCase().includes(q))
      : [...this.productos];
  }

  agregarAlCarrito(p: Producto): void {
    const item = this.carrito.find(i => i.producto.id_producto === p.id_producto);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ producto: p, cantidad: 1 });
    }
  }

  quitarDelCarrito(p: Producto): void {
    const idx = this.carrito.findIndex(i => i.producto.id_producto === p.id_producto);
    if (idx >= 0) {
      if (this.carrito[idx].cantidad > 1) {
        this.carrito[idx].cantidad--;
      } else {
        this.carrito.splice(idx, 1);
      }
    }
  }

  cantidadEnCarrito(p: Producto): number {
    return this.carrito.find(i => i.producto.id_producto === p.id_producto)?.cantidad ?? 0;
  }

  get totalCarrito(): number {
    return this.carrito.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0);
  }

  get carritoVacio(): boolean {
    return this.carrito.length === 0;
  }

  confirmarPedido(): void {
    if (this.carritoVacio) return;
    this.loading = true;
    const items: ItemPedido[] = this.carrito.map(i => ({
      id_producto: i.producto.id_producto,
      cantidad: i.cantidad
    }));
    this.pedidoSvc.create({
      direccion_entrega: this.direccion_entrega || undefined,
      notas: this.notas || undefined,
      items
    }).subscribe({
      next: (res: any) => {
        const id = res?.data?.id_pedido ?? res?.id_pedido;
        this.toastSvc.success('Pedido creado exitosamente');
        this.router.navigate(['/pedidos', id]);
      },
      error: (e: any) => {
        this.toastSvc.error(e.error?.message || 'Error al crear el pedido');
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pedidos']);
  }

  fmtCLP(n: number): string {
    if (n == null) return '—';
    return '$' + Math.round(n).toLocaleString('es-CL');
  }
}

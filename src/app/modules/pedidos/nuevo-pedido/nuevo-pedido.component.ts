import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.services';
import { PedidoService } from '../../../core/services/pedido.service';
import { PagoService } from '../../../core/services/pago.service';
import { ToastService } from '../../../core/services/toast.service';
import { ItemPedido } from '../../../core/models/pedido.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { ComunaService } from '../../../core/services/comuna.service';

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrl: './nuevo-pedido.component.scss'
})
export class NuevoPedidoComponent implements OnInit {
  direccion_entrega = '';
  notas = '';
  loading = false;
  ciudadEnvio: string = '';
  regionesConComunas: { region: string, comunas: any[] }[] = [];
  loadingComunas = false;

  searchTerm = '';
  loadingProductos = false;
  private todosProductos: Producto[] = [];
  filtrados: Producto[] = [];

  constructor(
    public cart: CartService,
    public auth: AuthService,
    private pedidoSvc: PedidoService,
    private pagoSvc: PagoService,
    private toastSvc: ToastService,
    private router: Router,
    private productoSvc: ProductoService,
    private comunaSvc: ComunaService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarComunas();
  }

  private cargarProductos(): void {
    this.loadingProductos = true;
    this.productoSvc.getAll().subscribe({
      next: (res: any) => {
        this.todosProductos = res.data ?? res ?? [];
        this.filtrados = [...this.todosProductos];
        this.loadingProductos = false;
      },
      error: () => { this.loadingProductos = false; }
    });
  }

  private cargarComunas(): void {
  this.loadingComunas = true;
  this.comunaSvc.getComunasAgrupadas().subscribe({
    next: (data) => {
      this.regionesConComunas = data;
      this.loadingComunas = false;
    },
    error: () => { this.loadingComunas = false; }
  });
}

  filtrar(): void {
    const term = this.searchTerm.toLowerCase();
    this.filtrados = this.todosProductos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.codigo_producto ?? '').toLowerCase().includes(term) ||
      (p.categoria ?? '').toLowerCase().includes(term)
    );
  }

  get carrito() { return this.cart.items; }
  get carritoVacio() { return this.cart.isEmpty; }
  get totalCarrito() { return this.cart.total; }

  agregarAlCarrito(p: Producto): void { this.cart.agregar(p); }
  quitarDelCarrito(p: Producto): void { this.cart.quitar(p); }
  cantidadEnCarrito(p: Producto): number { return this.cart.cantidad(p); }

  confirmarPedido(): void {
    if (this.cart.isEmpty) return;

    // Si no está logueado, redirige al login y vuelve aquí después
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/pedidos/nuevo' } });
      return;
    }

    // Dirección obligatoria para Shipit
    if (!this.direccion_entrega.trim() || !this.ciudadEnvio.trim()) {
      alert('Debes ingresar dirección y comuna');
      return;
    }

    this.loading = true;

    const items: ItemPedido[] = this.cart.items.map(i => ({
      id_producto: i.producto.id_producto,
      cantidad: i.cantidad
    }));

    // Paso 1: Crear el pedido
    this.pedidoSvc.create({
      direccion_entrega: this.direccion_entrega.trim(),
      comuna: this.ciudadEnvio.trim(),
      notas: this.notas || undefined,
      items
    }).subscribe({
      next: (res: any) => {
        const idPedido = res?.data?.id_pedido ?? res?.id_pedido;
        this.cart.limpiar();

        // Paso 2: Iniciar pago Webpay
        this.pagoSvc.iniciar(idPedido).subscribe({
          next: (pagoRes: any) => {
            const data = pagoRes?.data ?? pagoRes;
            // Paso 3: Redirigir al formulario de Transbank
            window.location.href = `${data.url_pago}?token_ws=${data.token}`;
          },
          error: (e: any) => {
            // El pedido fue creado pero el pago falló — llevar al detalle del pedido
            this.toastSvc.error(e.error?.message || 'Error al iniciar el pago');
            this.router.navigate(['/pedidos', idPedido]);
            this.loading = false;
          }
        });
      },
      error: (e: any) => {
        this.toastSvc.error(e.error?.message || 'Error al crear el pedido');
        this.loading = false;
      }
    });
  }

  volver(): void { this.router.navigate(['/productos']); }

  fmtCLP(n: number): string {
    if (n == null) return '—';
    return '$' + Math.round(n).toLocaleString('es-CL');
  }

  get esClienteB2B(): boolean {
    return this.auth.hasRole('ejecutivo', 'cliente_b2b', 'admin');
  }
}
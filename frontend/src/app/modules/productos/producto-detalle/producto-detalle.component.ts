import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.services';
import { ToastService } from '../../../core/services/toast.service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.scss']
})
export class ProductoDetalleComponent implements OnInit {
  producto: Producto | null = null;
  loading = true;
  cantidadLocal = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoSvc: ProductoService,
    public auth: AuthService,
    public cart: CartService,
    private toastSvc: ToastService
  ) { }

  ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo')!;
    this.productoSvc.getByCodigo(codigo).subscribe({
      next: (res: any) => { this.producto = res.data ?? res; this.loading = false; },
      error: () => {
        this.loading = false;
        this.toastSvc.error('Producto no encontrado');
        this.router.navigate(['/productos']);
      }
    });
  }

  // ── Stock ─────────────────────────────────────────────────
  get stockDisponible(): number {
    return this.producto?.stock_total ?? 0;
  }

  get maxAlcanzado(): boolean {
    return this.cantidadLocal >= this.stockDisponible;
  }

  // ── Contador local ────────────────────────────────────────
  incrementar(): void {
    if (this.maxAlcanzado) return;
    this.cantidadLocal++;
  }

  decrementar(): void {
    if (this.cantidadLocal > 0) this.cantidadLocal--;
  }

  agregarAlPedido(): void {
    if (!this.producto || this.cantidadLocal === 0) return;
    const cantidad = Math.min(this.cantidadLocal, this.stockDisponible);
    for (let i = 0; i < cantidad; i++) {
      this.cart.agregar(this.producto);
    }
    this.toastSvc.success(`${cantidad} × ${this.producto.nombre} agregado al pedido`);
    this.cantidadLocal = 0;
  }

  irAlCarrito(): void {
    this.router.navigate(['/pedidos/nuevo']);
  }

  // ── Permisos ──────────────────────────────────────────────
  canPedir(): boolean  { return true; }
  isAdmin(): boolean   { return this.auth.hasRole('admin'); }
  canManage(): boolean { return this.auth.hasRole('admin', 'ejecutivo'); }

  // ── Helpers ───────────────────────────────────────────────
  goBack(): void { this.router.navigate(['/productos']); }
  fmtCLP(n: number): string { return '$' + Math.round(n || 0).toLocaleString('es-CL'); }

  delete(): void {
    if (!this.producto || !confirm('¿Eliminar este producto?')) return;
    this.productoSvc.delete(this.producto.id_producto).subscribe({
      next: () => { this.toastSvc.success('Eliminado'); this.router.navigate(['/productos']); },
      error: (e: any) => this.toastSvc.error(e.error?.message || 'Error')
    });
  }
}
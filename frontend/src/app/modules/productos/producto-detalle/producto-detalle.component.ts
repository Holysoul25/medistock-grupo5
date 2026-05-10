import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto } from '../../../core/models/producto.model';

@Component({ selector: 'app-producto-detalle', templateUrl: './producto-detalle.component.html', styleUrls: ['./producto-detalle.component.scss'] })
export class ProductoDetalleComponent implements OnInit {
  producto: Producto | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoSvc: ProductoService,
    public auth: AuthService,
    private toastSvc: ToastService
  ) {}

  ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo')!;
    this.productoSvc.getByCodigo(codigo).subscribe({
      next: (res: any) => { this.producto = res.data ?? res; this.loading = false; },
      error: () => { this.loading = false; this.toastSvc.error('Producto no encontrado'); this.router.navigate(['/productos']); }
    });
  }

  goBack() { this.router.navigate(['/productos']); }
  fmtCLP(n: number) { return '$' + Math.round(n||0).toLocaleString('es-CL'); }
  isAdmin() { return this.auth.hasRole('admin'); }
  canManage() { return this.auth.hasRole('admin', 'ejecutivo'); }

  delete() {
    if (!this.producto || !confirm('¿Eliminar este producto?')) return;
    this.productoSvc.delete(this.producto.id_producto).subscribe({
      next: () => { this.toastSvc.success('Eliminado'); this.router.navigate(['/productos']); },
      error: (e: any) => this.toastSvc.error(e.error?.message || 'Error')
    });
  }
}

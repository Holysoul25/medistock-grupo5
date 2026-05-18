import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.services';
import { ToastService } from '../../../core/services/toast.service';
import { Producto, ProductoForm } from '../../../core/models/producto.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export type ModoVenta = 'b2c' | 'b2b';
export const MIN_MAYORISTA = 3;

@Component({ selector: 'app-catalogo', templateUrl: './catalogo.component.html', styleUrls: ['./catalogo.component.scss'] })
export class CatalogoComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  suspendidos: Producto[] = [];
  filtered: Producto[] = [];
  loading = true;
  error = false;
  showDashboard = false;
  searchTerm = '';
  categoriaActiva = '';
  showModal = false;
  editingId: number | null = null;
  form!: FormGroup;
  modo: ModoVenta = 'b2c';
  readonly MIN_MAYORISTA = MIN_MAYORISTA;
  private destroy$ = new Subject<void>();

  constructor(
    public auth: AuthService,
    public cart: CartService,
    private productoSvc: ProductoService,
    private toastSvc: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() { this.buildForm(); this.inicializarModo(); this.load(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private get esSoloB2C(): boolean {
    return !this.auth.isAuthenticated || this.auth.hasRole('cliente_b2c');
  }
  private get esSoloB2B(): boolean {
    return this.auth.isAuthenticated && this.auth.hasRole('cliente_b2b', 'operador');
  }
  get puedeToggle(): boolean {
    return this.auth.isAuthenticated && this.auth.hasRole('admin', 'ejecutivo', 'analista');
  }

  private inicializarModo(): void {
    this.resolverModo();
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe(() => this.resolverModo());
  }

  private resolverModo(): void {
    if (this.esSoloB2C) this.modo = 'b2c';
    else if (this.esSoloB2B) this.modo = 'b2b';
    else this.modo = this.auth.hasRole('admin', 'ejecutivo') ? 'b2b' : 'b2c';
  }

  get esB2B(): boolean { return this.modo === 'b2b'; }
  cambiarModo(m: ModoVenta): void { if (!this.puedeToggle) return; this.modo = m; }

  precioMostrado(p: Producto): number {
    return this.esB2B && this.cantidad(p) >= MIN_MAYORISTA ? Math.round(p.precio * 0.85) : p.precio;
  }
  tienePrecioMayorista(p: Producto): boolean { return this.esB2B && this.cantidad(p) >= MIN_MAYORISTA; }
  unidadesParaMayorista(p: Producto): number { return this.esB2B ? Math.max(0, MIN_MAYORISTA - this.cantidad(p)) : 0; }

  buildForm() {
    this.form = this.fb.group({
      codigo_producto: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio_unitario: [null, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      unidad_medida: ['', Validators.required],
      requiere_receta: [0],
      stock_inicial: [0],
      stock_minimo: [10],
    });
  }

  load() {
    this.loading = true;
    this.error = false;

    this.productoSvc.getAll().subscribe({
      next: (res: any) => {
        const todos: Producto[] = res.data ?? res ?? [];
        this.productos   = todos.filter(p => (p.activo ?? 1) !== 0);
        this.suspendidos = this.isAdmin() ? todos.filter(p => (p.activo ?? 1) === 0) : [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  applyFilter() {
    let list = [...this.productos];
    if (this.categoriaActiva) list = list.filter(p => p.categoria === this.categoriaActiva);
    const q = this.searchTerm.toLowerCase();
    if (q) list = list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.codigo_producto || '').toLowerCase().includes(q) ||
      (p.categoria || '').toLowerCase().includes(q)
    );
    this.filtered = list;
  }

  get categorias(): string[] { return [...new Set(this.productos.map(p => p.categoria))].sort(); }
  get categoriaStats() {
    const map: Record<string, number> = {};
    this.productos.forEach(p => map[p.categoria] = (map[p.categoria] || 0) + 1);
    const max = Math.max(...Object.values(map), 1);
    return Object.entries(map).map(([cat, count]) => ({ cat, count, pct: Math.round(count / max * 100) }));
  }

  filtrarCategoria(cat: string) { this.categoriaActiva = this.categoriaActiva === cat ? '' : cat; this.applyFilter(); }

  get totalProductos() { return this.productos.length; }
  get totalCategorias() { return new Set(this.productos.map(p => p.categoria)).size; }
  get conReceta() { return this.productos.filter(p => p.requiere_receta).length; }

  agregar(p: Producto) { this.cart.agregar(p); }
  quitar(p: Producto) { this.cart.quitar(p); }
  cantidad(p: Producto) { return this.cart.cantidad(p); }

  irAlCarrito() {
    if (this.auth.isAuthenticated) this.router.navigate(['/pedidos/nuevo']);
    else this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/pedidos/nuevo' } });
  }

  canManage() { return this.auth.hasRole('admin', 'ejecutivo'); }
  isAdmin() { return this.auth.hasRole('admin'); }

  openAdd() {
    this.editingId = null;
    this.form.reset({ requiere_receta: 0, stock_inicial: 0, stock_minimo: 10 });
    this.showModal = true;
  }

  delete(p: Producto, e: Event) {
    e.stopPropagation();
    if (!confirm(`¿Eliminar permanentemente "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.productoSvc.delete(p.id_producto).subscribe({
      next: () => { this.toastSvc.success('Producto eliminado'); this.load(); },
      error: (e: any) => this.toastSvc.error(e.error?.message || 'Error al eliminar')
    });
  }

  openEdit(p: Producto, e: Event) {
    e.stopPropagation();
    this.editingId = p.id_producto;
    this.form.patchValue({
      codigo_producto: p.codigo_producto,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio_unitario: p.precio,
      categoria: p.categoria,
      unidad_medida: p.unidad_medida,
      requiere_receta: p.requiere_receta ? 1 : 0
    });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const body = this.form.value as ProductoForm;
    const action$ = this.editingId
      ? this.productoSvc.update(this.editingId, body)
      : this.productoSvc.create(body);
    action$.subscribe({
      next: () => { this.toastSvc.success(this.editingId ? 'Producto actualizado' : 'Producto creado'); this.showModal = false; this.load(); },
      error: (e: any) => this.toastSvc.error(e.error?.message || 'Error')
    });
  }

  toggleActivo(p: Producto, e: Event) {
    e.stopPropagation();
    const accion = p.activo ? 'suspender' : 'reactivar';
    if (!confirm(`¿${p.activo ? 'Suspender' : 'Reactivar'} "${p.nombre}"?`)) return;

    const req$ = p.activo
      ? this.productoSvc.delete(p.id_producto)
      : this.productoSvc.reactivar(p.id_producto);

    req$.subscribe({
      next: () => { this.toastSvc.success(`Producto ${accion}do`); this.load(); },
      error: (e: any) => this.toastSvc.error(e.error?.message || 'Error')
    });
  }

  fmtCLP(n: number) { return n == null ? '—' : '$' + Math.round(n).toLocaleString('es-CL'); }
  field(n: string) { return this.form.get(n); }
  invalid(n: string) { const f = this.field(n); return f?.invalid && f?.touched; }
}
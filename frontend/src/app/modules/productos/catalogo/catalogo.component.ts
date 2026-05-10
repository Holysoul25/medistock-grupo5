import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto, ProductoForm } from '../../../core/models/producto.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({ selector: 'app-catalogo', templateUrl: './catalogo.component.html', styleUrls: ['./catalogo.component.scss'] })
export class CatalogoComponent implements OnInit {
  productos: Producto[] = [];
  filtered: Producto[] = [];
  loading = true;
  showDashboard = false;
  searchTerm = '';
  showModal = false;
  editingId: number | null = null;
  form!: FormGroup;

  constructor(
    public auth: AuthService,
    private productoSvc: ProductoService,
    private toastSvc: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();
    this.load();
  }

  buildForm() {
    this.form = this.fb.group({
      codigo_producto: ['', Validators.required],
      nombre:          ['', Validators.required],
      descripcion:     [''],
      precio_unitario: [null, [Validators.required, Validators.min(0)]],
      categoria:       ['', Validators.required],
      unidad_medida:   ['', Validators.required],
      requiere_receta: [0]
    });
  }

  load() {
    this.loading = true;
    this.productoSvc.getAll().subscribe({
      next: (res: any) => {
        this.productos = res.data ?? res ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    const q = this.searchTerm.toLowerCase();
    this.filtered = q
      ? this.productos.filter(p =>
          p.nombre.toLowerCase().includes(q) ||
          (p.codigo_producto||'').toLowerCase().includes(q) ||
          (p.categoria||'').toLowerCase().includes(q))
      : [...this.productos];
  }

  get totalProductos() { return this.productos.length; }
  get totalCategorias() { return new Set(this.productos.map(p => p.categoria)).size; }
  get conReceta() { return this.productos.filter(p => p.requiere_receta).length; }

  get categorias(): { cat: string; count: number; pct: number }[] {
    const map: Record<string,number> = {};
    this.productos.forEach(p => map[p.categoria] = (map[p.categoria]||0)+1);
    const max = Math.max(...Object.values(map), 1);
    return Object.entries(map).map(([cat, count]) => ({ cat, count, pct: Math.round(count/max*100) }));
  }

  canManage() { return this.auth.hasRole('admin', 'ejecutivo'); }
  isAdmin() { return this.auth.hasRole('admin'); }

  openAdd() {
    this.editingId = null;
    this.form.reset({ requiere_receta: 0 });
    this.showModal = true;
  }

  openEdit(p: Producto) {
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

  delete(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.productoSvc.delete(p.id_producto).subscribe({
      next: () => { this.toastSvc.success('Producto eliminado'); this.load(); },
      error: (e: any) => this.toastSvc.error(e.error?.message || 'Error')
    });
  }

  fmtCLP(n: number) {
    if (n === null || n === undefined) return '—';
    return '$' + Math.round(n).toLocaleString('es-CL');
  }

  field(n: string) { return this.form.get(n); }
  invalid(n: string) { const f = this.field(n); return f?.invalid && f?.touched; }
}

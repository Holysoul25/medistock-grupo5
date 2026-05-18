import { Component, OnInit } from '@angular/core';
import { forkJoin, catchError, of } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';
import { DivisaService } from '../../../core/services/divisa.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';
import { Producto } from '../../../core/models/producto.model';

interface KpiCard {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  color: string;
}

interface EstadoInfo {
  label: string;
  color: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-reportes-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ReportesDashboardComponent implements OnInit {
  loading = true;
  accesoDenegado = false;
  pedidos: Pedido[] = [];
  productos: Producto[] = [];
  dolar: { valor_clp: number; fecha: string } | null = null;

  kpis: KpiCard[] = [];
  estadoStats: EstadoInfo[] = [];
  pedidosRecientes: Pedido[] = [];
  stockBajo: Producto[] = [];
  categoriaStats: { cat: string; count: number; pct: number }[] = [];

  today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  readonly ROLES_PERMITIDOS = ['admin', 'ejecutivo', 'analista'];

  readonly ESTADO_META: Record<EstadoPedido, { label: string; color: string }> = {
    pendiente:  { label: 'Pendiente',  color: '#F59E0B' },
    aprobado:   { label: 'Aprobado',   color: '#3B82F6' },
    despachado: { label: 'Despachado', color: '#8B5CF6' },
    entregado:  { label: 'Entregado',  color: '#10B981' },
    cancelado:  { label: 'Cancelado',  color: '#EF4444' },
  };

  constructor(
    public auth: AuthService,
    private pedidoSvc: PedidoService,
    private productoSvc: ProductoService,
    private divisaSvc: DivisaService
  ) {}

  ngOnInit() {
    if (!this.auth.hasRole(...this.ROLES_PERMITIDOS)) {
      this.accesoDenegado = true;
      this.loading = false;
      return;
    }

    this.divisaSvc.getDolar().subscribe({
      next: (res: any) => this.dolar = res.data ?? res,
      error: () => {}
    });

    forkJoin({
      pedidos:   this.pedidoSvc.getAll().pipe(catchError(() => of({ data: [] }))),
      productos: this.productoSvc.getAll().pipe(catchError(() => of({ data: [] })))
    }).subscribe(({ pedidos, productos }) => {
      this.pedidos   = (pedidos?.data ?? pedidos ?? []) as Pedido[];
      this.productos = (productos?.data ?? productos ?? []) as Producto[];
      this.compute();
      this.loading = false;
    });
  }

  private compute() {
    const totalVentas = this.pedidos
      .filter(p => p.estado === 'entregado')
      .reduce((s, p) => s + (parseFloat(p.total as any) || 0), 0);

    const pendientes = this.pedidos.filter(p => p.estado === 'pendiente').length;
    const entregados = this.pedidos.filter(p => p.estado === 'entregado').length;

    this.kpis = [
      { label: 'Total Pedidos',  value: this.pedidos.length,      sub: `${entregados} entregados`,   icon: '📦', color: '#3B82F6' },
      { label: 'Ventas Totales', value: this.fmtCLP(totalVentas), sub: 'pedidos entregados',         icon: '💰', color: '#10B981' },
      { label: 'Pendientes',     value: pendientes,                sub: 'requieren atención',         icon: '⏳', color: '#F59E0B' },
      { label: 'Productos',      value: this.productos.length,     sub: `${new Set(this.productos.map(p => p.categoria)).size} categorías`, icon: '💊', color: '#8B5CF6' }
    ];

    const estadoCounts: Partial<Record<EstadoPedido, number>> = {};
    this.pedidos.forEach(p => {
      estadoCounts[p.estado] = (estadoCounts[p.estado] ?? 0) + 1;
    });
    const total = this.pedidos.length || 1;
    this.estadoStats = (Object.keys(this.ESTADO_META) as EstadoPedido[]).map(e => ({
      label: this.ESTADO_META[e].label,
      color: this.ESTADO_META[e].color,
      count: estadoCounts[e] ?? 0,
      pct: Math.round(((estadoCounts[e] ?? 0) / total) * 100)
    }));

    this.pedidosRecientes = [...this.pedidos]
      .sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime())
      .slice(0, 6);

    this.stockBajo = this.productos
      .filter(p => p.stock?.some(s => s.cantidad <= s.stock_minimo))
      .slice(0, 5);

    const catMap: Record<string, number> = {};
    this.productos.forEach(p => { catMap[p.categoria] = (catMap[p.categoria] ?? 0) + 1; });
    const maxCat = Math.max(...Object.values(catMap), 1);
    this.categoriaStats = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, count]) => ({ cat, count, pct: Math.round((count / maxCat) * 100) }));
  }

  estadoColor(estado: EstadoPedido): string { return this.ESTADO_META[estado]?.color ?? '#6B7280'; }
  estadoLabel(estado: EstadoPedido): string { return this.ESTADO_META[estado]?.label ?? estado; }

  fmtCLP(n: any): string {
    if (!n) return '$0';
    return '$' + Math.round(parseFloat(n)).toLocaleString('es-CL');
  }

  fmtFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStockMin(p: Producto): number { return p.stock?.[0]?.cantidad ?? 0; }
}
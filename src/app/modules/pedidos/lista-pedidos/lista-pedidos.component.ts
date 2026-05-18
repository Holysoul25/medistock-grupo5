import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.component.html',
  styleUrl: './lista-pedidos.component.scss'
})
export class ListaPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  cargando = true;
  error: string | null = null;
  filtroEstado: string = 'todos';

  readonly estados: { valor: string; label: string }[] = [
    { valor: 'todos',      label: 'Todos' },
    { valor: 'pendiente',  label: 'Pendiente' },
    { valor: 'aprobado',   label: 'Aprobado' },
    { valor: 'despachado', label: 'Despachado' },
    { valor: 'entregado',  label: 'Entregado' },
    { valor: 'cancelado',  label: 'Cancelado' },
  ];

  constructor(
    private pedidoSvc: PedidoService,
    public auth: AuthService,
    private router: Router
  ) {}

  get canCreate() { return this.auth.hasRole('admin', 'ejecutivo', 'cliente'); }
  get esAdmin()   { return this.auth.hasRole('admin', 'ejecutivo', 'operador', 'analista'); }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = null;

    // Admin/ejecutivo ve todos; cliente ve solo los suyos
    const request$ = this.esAdmin
      ? this.pedidoSvc.getAll()
      : this.pedidoSvc.getMisPedidos();

    request$.subscribe({
      next: (res: any) => {
        this.pedidos = res.data ?? res ?? [];
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
        this.error = 'No se pudieron cargar los pedidos. Intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(): void {
    this.pedidosFiltrados = this.filtroEstado === 'todos'
      ? [...this.pedidos]
      : this.pedidos.filter(p => p.estado === this.filtroEstado);
  }

  onFiltroChange(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  verDetalle(id: number): void { this.router.navigate(['/pedidos', id]); }
  nuevoPedido(): void { this.router.navigate(['/pedidos/nuevo']); }

  badgeClass(estado: EstadoPedido): string {
    const mapa: Record<EstadoPedido, string> = {
      pendiente:  'badge-pendiente',
      aprobado:   'badge-aprobado',
      despachado: 'badge-despachado',
      entregado:  'badge-entregado',
      cancelado:  'badge-cancelado',
    };
    return mapa[estado] ?? '';
  }
}
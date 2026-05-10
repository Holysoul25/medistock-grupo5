import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reportes-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ReportesDashboardComponent implements OnInit {
  pedidos: any[] = [];
  loading = true;
  totalVentas = 0;
  totalPedidos = 0;
  pedidosPorEstado: { estado: string; count: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/pedidos`).subscribe({
      next: (res) => {
        this.pedidos = res.data ?? res ?? [];
        this.calcularStats();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  calcularStats(): void {
    this.totalPedidos = this.pedidos.length;
    this.totalVentas = this.pedidos.reduce((sum: number, p: any) => sum + (p.total || 0), 0);

    const mapa: Record<string, number> = {};
    this.pedidos.forEach((p: any) => {
      mapa[p.estado] = (mapa[p.estado] || 0) + 1;
    });
    this.pedidosPorEstado = Object.entries(mapa).map(([estado, count]) => ({ estado, count }));
  }

  fmtCLP(n: number) {
    return '$' + Math.round(n || 0).toLocaleString('es-CL');
  }
}

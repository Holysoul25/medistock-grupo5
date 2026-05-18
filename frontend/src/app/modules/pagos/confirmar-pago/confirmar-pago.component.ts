import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../../core/services/pago.service';

@Component({
  selector: 'app-confirmar-pago',
  templateUrl: './confirmar-pago.component.html',
  styleUrl: './confirmar-pago.component.scss'
})
export class ConfirmarPagoComponent implements OnInit {
  estado: 'cargando' | 'aprobado' | 'rechazado' | 'error' = 'cargando';
  mensaje = '';
  idPedido: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoSvc: PagoService
  ) {}

  ngOnInit(): void {
    const tokenWs = this.route.snapshot.queryParamMap.get('token_ws');
    if (!tokenWs) {
      this.estado = 'error';
      this.mensaje = 'No se recibió token de confirmación.';
      return;
    }
    this.pagoSvc.confirmar(tokenWs).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        if (data?.aprobado) {
          this.estado = 'aprobado';
          this.idPedido = data?.id_pedido ?? null;
          this.mensaje = 'Pago aprobado exitosamente.';
        } else {
          this.estado = 'rechazado';
          this.mensaje = data?.mensaje || 'El pago fue rechazado.';
        }
      },
      error: (e: any) => {
        this.estado = 'error';
        this.mensaje = e.error?.message || 'Error al confirmar el pago.';
      }
    });
  }

  irAPedidos(): void { this.router.navigate(['/pedidos']); }
  irAlPedido(): void { this.router.navigate(['/pedidos', this.idPedido]); }
}

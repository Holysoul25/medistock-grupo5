import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PagoService } from '../../../core/services/pago.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.scss'
})
export class DetallePedidoComponent implements OnInit {
  pedido: Pedido | null = null;
  cargando = true;
  error: string | null = null;
  iniciandoPago = false;

  readonly estadosValidos: EstadoPedido[] = ['pendiente','aprobado','despachado','entregado','cancelado'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoSvc: PedidoService,
    private pagoSvc: PagoService,
    public auth: AuthService
  ) {}

  /** Solo admin, ejecutivo y operador pueden cambiar estado */
  get canChangeEstado() { return this.auth.hasRole('admin', 'ejecutivo', 'operador'); }

  /** Solo cliente y ejecutivo pueden iniciar pago (y solo si estado es pendiente) */
  get canIniciarPago() {
    return this.auth.hasRole('cliente', 'ejecutivo', 'admin')
      && this.pedido?.estado === 'pendiente';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pedidoSvc.getById(id).subscribe({
      next: (res: any) => {
        this.pedido = res?.data ?? res;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el pedido.';
        this.cargando = false;
      }
    });
  }

  cambiarEstado(estado: string): void {
    if (!this.pedido) return;
    this.pedidoSvc.updateEstado(this.pedido.id_pedido, estado).subscribe({
      next: (res: any) => { this.pedido = res?.data ?? res; },
      error: () => { alert('Error al cambiar el estado.'); }
    });
  }

  iniciarPago(): void {
    if (!this.pedido) return;
    this.iniciandoPago = true;
    this.pagoSvc.iniciar(this.pedido.id_pedido).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        // Webpay devuelve url_pago, redirigir al usuario
        if (data?.url_pago) {
          window.location.href = data.url_pago;
        } else {
          alert('No se recibió URL de pago.');
          this.iniciandoPago = false;
        }
      },
      error: (e: any) => {
        alert(e.error?.message || 'Error al iniciar el pago.');
        this.iniciandoPago = false;
      }
    });
  }

  volver(): void { this.router.navigate(['/pedidos']); }
}

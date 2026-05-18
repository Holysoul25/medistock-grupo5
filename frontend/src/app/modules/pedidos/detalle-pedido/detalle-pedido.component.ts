import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PagoService } from '../../../core/services/pago.service';
import { LogisticaService } from '../../../core/services/logistica.service';
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

  // Shipit
  generandoEnvio = false;
  ciudadEnvio = '';
  tracking: any = null;
  cargandoTracking = false;

  readonly estadosValidos: EstadoPedido[] = ['pendiente', 'aprobado', 'despachado', 'entregado', 'cancelado'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoSvc: PedidoService,
    private pagoSvc: PagoService,
    private logisticaSvc: LogisticaService,
    public auth: AuthService
  ) { }

  get canChangeEstado() { return this.auth.hasRole('admin', 'ejecutivo', 'operador'); }
  get canIniciarPago() {
    return this.auth.hasRole('cliente', 'ejecutivo', 'admin')
      && this.pedido?.estado === 'pendiente';
  }
  get canGenerarEnvio() {
    return this.auth.hasRole('admin', 'operador')
      && this.pedido?.estado === 'aprobado';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPedido(id);
  }

  cargarPedido(id: number): void {
  this.pedidoSvc.getById(id).subscribe({
    next: (res: any) => {
      this.pedido = res?.data ?? res;
      this.ciudadEnvio = (this.pedido as any)?.comuna || '';
      this.cargando = false;

      if (this.pedido?.estado === 'despachado') {
        if (this.pedido?.codigo_seguimiento) {
          this.cargarTracking(this.pedido.codigo_seguimiento);
        } else {
          this.cargandoTracking = false; // evita spinner infinito
        }
      }
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
        if (data?.url_pago) {
          window.location.href = `${data.url_pago}?token_ws=${data.token}`;
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

  generarEnvio(): void {
    if (!this.pedido) return;
    this.generandoEnvio = true;
    this.logisticaSvc.generarEnvio(this.pedido.id_pedido, {
      nombre_destinatario: this.pedido.cliente,
      direccion: this.pedido.direccion_entrega,
      ciudad: this.ciudadEnvio,
    }).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        // Actualizar pedido localmente con datos de Shipit
        if (this.pedido) {
          this.pedido = {
            ...this.pedido,
            estado: 'despachado',
            codigo_seguimiento: data.codigo_seguimiento,
            fecha_estimada_entrega: data.fecha_estimada_entrega,
            etiqueta_url: data.etiqueta_url,
          };
          if (data.codigo_seguimiento) {
            this.cargarTracking(data.codigo_seguimiento);
          }
        }
        this.generandoEnvio = false;
      },
      error: (e: any) => {
        alert(e.error?.message || 'Error al generar el envío.');
        this.generandoEnvio = false;
      }
    });
  }

  cargarTracking(codigo: string): void {
    this.cargandoTracking = true;
    this.logisticaSvc.consultarTracking(codigo).subscribe({
      next: (res: any) => {
        this.tracking = res?.data ?? res;
        this.cargandoTracking = false;
      },
      error: () => { this.cargandoTracking = false; }
    });
  }

  volver(): void { this.router.navigate(['/pedidos']); }
}
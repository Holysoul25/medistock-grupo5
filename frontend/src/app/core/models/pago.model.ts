export interface IniciarPagoResponse {
  token: string;
  url_pago: string;
  mensaje: string;
}

export interface ConfirmarPagoResponse {
  aprobado: boolean;
  estado_pago: 'aprobado' | 'rechazado';
  monto: number;
  codigo_autorizacion: string;
  tipo_pago: string;
  fecha: string;
  buy_order: string;
}
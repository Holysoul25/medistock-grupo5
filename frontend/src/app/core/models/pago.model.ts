export interface IniciarPagoResponse { url: string; token: string; }
export interface ConfirmarPagoResponse { estado: string; monto: number; referencia: string; }

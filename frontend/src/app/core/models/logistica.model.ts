export interface EnvioResponse { codigo_seguimiento: string; estado: string; }
export interface TrackingEvento { descripcion: string; fecha: string; }
export interface TrackingResponse { codigo: string; estado: string; eventos?: TrackingEvento[]; }

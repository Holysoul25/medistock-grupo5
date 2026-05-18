export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: 'admin' | 'ejecutivo' | 'operador' | 'analista' | 'cliente';
  telefono?: string;
}

export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest {
  nombre: string; apellido?: string; email: string;
  password: string; rol?: string; rut?: string; telefono?: string;
}
export interface AuthResponse { token: string; user?: Usuario; usuario?: Usuario; }

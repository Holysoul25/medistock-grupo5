import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: number;
  rol: string;
  id_rol: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private base = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll()                          { return this.http.get<any>(this.base); }
  getById(id: number)               { return this.http.get<any>(`${this.base}/${id}`); }
  update(id: number, data: any)     { return this.http.put<any>(`${this.base}/${id}`, data); }
  remove(id: number)                { return this.http.delete<any>(`${this.base}/${id}`); }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NuevoPedidoRequest, Pedido } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private api = `${environment.apiUrl}/pedidos`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; message: string; data: Pedido[] }> {
    return this.http.get<{ success: boolean; message: string; data: Pedido[] }>(this.api);
  }

  // ← NUEVO: solo los pedidos del usuario autenticado
  getMisPedidos(): Observable<{ success: boolean; message: string; data: Pedido[] }> {
    return this.http.get<{ success: boolean; message: string; data: Pedido[] }>(`${this.api}/mis-pedidos`);
  }

  getById(id: number): Observable<any> { return this.http.get(`${this.api}/${id}`); }
  create(r: NuevoPedidoRequest): Observable<any> { return this.http.post(this.api, r); }
  updateEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.api}/${id}/estado`, { estado });
  }
}
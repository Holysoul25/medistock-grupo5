import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoForm } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = `${environment.apiUrl}/productos`;
  constructor(private http: HttpClient) { }

  getAll(): Observable<any> { return this.http.get(this.api); }
  getByCodigo(c: string): Observable<any> { return this.http.get(`${this.api}/${c}`); }
  create(p: ProductoForm): Observable<any> { return this.http.post(this.api, p); }
  update(id: number, p: Partial<ProductoForm>): Observable<any> { return this.http.put(`${this.api}/${id}`, p); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }
  reactivar(id: number) { return this.http.patch<any>(`${this.api}/${id}/reactivar`, {}); }
}

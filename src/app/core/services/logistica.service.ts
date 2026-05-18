import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LogisticaService {
  private api = `${environment.apiUrl}/logistica`;
  constructor(private http: HttpClient) {}

  generarEnvio(idPedido: number, datos: {
    nombre_destinatario?: string;
    direccion?: string;
    ciudad: string;
    telefono?: string;
    peso_kg?: number;
  }): Observable<any> {
    return this.http.post(`${this.api}/${idPedido}/envio`, datos);
  }

  consultarTracking(codigo: string): Observable<any> {
    return this.http.get(`${this.api}/tracking/${codigo}`);
  }
}
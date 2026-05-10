import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private api = `${environment.apiUrl}/pagos`;
  constructor(private http: HttpClient) {}

  iniciar(idPedido: number): Observable<any>   { return this.http.post(`${this.api}/${idPedido}/iniciar`, {}); }
  confirmar(tokenWs: string): Observable<any>  { return this.http.post(`${this.api}/confirmar`, { token_ws: tokenWs }); }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DivisaService {
  private api = `${environment.apiUrl}/divisas`;
  constructor(private http: HttpClient) {}

  getDolar(): Observable<any> { return this.http.get(`${this.api}/dolar`); }
  convertir(monto: number): Observable<any> { return this.http.get(`${this.api}/convertir?monto=${monto}`); }
}
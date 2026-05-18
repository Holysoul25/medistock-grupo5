import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComunaService {
  constructor(private http: HttpClient) {}

  getComunasAgrupadas() {
    return this.http.get<any>(`${environment.apiUrl}/comunas`).pipe(
      map(res => {
        const comunas: any[] = res.data;
        // Agrupar por región
        const regiones: { [key: string]: any[] } = {};
        comunas.forEach(c => {
          const region = c.region_name || 'Otras';
          if (!regiones[region]) regiones[region] = [];
          regiones[region].push(c);
        });
        // Convertir a array ordenado
        return Object.entries(regiones)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([region, comunas]) => ({ region, comunas }));
      })
    );
  }
}
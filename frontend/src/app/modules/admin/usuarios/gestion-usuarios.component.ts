import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // El backend tiene GET /api/usuarios/me — para listar usuarios
    // se necesitaría una ruta admin adicional en el backend.
    // Por ahora mostramos el perfil propio como placeholder.
    this.http.get<any>(`${environment.apiUrl}/usuarios/me`).subscribe({
      next: (res) => {
        const u = res?.data ?? res;
        this.usuarios = [u];
        this.loading = false;
      },
      error: (e) => {
        this.error = e.error?.message || 'Error cargando usuarios';
        this.loading = false;
      }
    });
  }
}

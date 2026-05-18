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

  showModal = false;
  editando: any = null;
  guardando = false;

  showModalCrear = false;
  creando = false;
  nuevo: any = null;

  readonly roles = ['admin', 'ejecutivo', 'operador', 'analista', 'cliente'];
  private base = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    this.http.get<any>(this.base).subscribe({
      next: (res) => { this.usuarios = res?.data ?? res; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Error cargando usuarios'; this.loading = false; }
    });
  }

  openEdit(u: any) { this.editando = { ...u }; this.showModal = true; }

  guardar() {
    if (!this.editando) return;
    this.guardando = true;
    this.http.put<any>(`${this.base}/${this.editando.id_usuario}`, this.editando).subscribe({
      next: () => { this.showModal = false; this.guardando = false; this.cargar(); },
      error: () => { alert('Error al actualizar.'); this.guardando = false; }
    });
  }

  eliminar(u: any) {
    if (!confirm(`¿Desactivar a ${u.nombre}?`)) return;
    this.http.delete<any>(`${this.base}/${u.id_usuario}`).subscribe({
      next: () => this.cargar(),
      error: () => alert('Error al desactivar usuario.')
    });
  }

  openCrear() {
  this.nuevo = {
    nombre: '', apellido: '', email: '', password: '',
    rut: '', telefono: '', rol: 'cliente', tipo_cliente: 'B2C'
  };
  this.showModalCrear = true;
}

crear() {
  if (!this.nuevo) return;
  this.creando = true;
  this.http.post<any>(`${this.base}/register`, this.nuevo).subscribe({
    next: () => {
      this.showModalCrear = false;
      this.creando = false;
      this.cargar();
    },
    error: (e) => {
      alert(e.error?.message || 'Error al crear usuario.');
      this.creando = false;
    }
  });
}
}
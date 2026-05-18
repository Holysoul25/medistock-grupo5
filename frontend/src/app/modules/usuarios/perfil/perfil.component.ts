import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  clienteInfo: any = null;
  loading = true;

  readonly ROL_META: Record<string, { label: string; icon: string; color: string }> = {
    admin:     { label: 'Administrador', icon: '👑', color: '#8B5CF6' },
    ejecutivo: { label: 'Ejecutivo',     icon: '💼', color: '#3B82F6' },
    operador:  { label: 'Operador',      icon: '⚙️',  color: '#F59E0B' },
    analista:  { label: 'Analista',      icon: '📊', color: '#10B981' },
    cliente:   { label: 'Cliente',       icon: '🛒', color: '#6B7280' },
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.usuario = data;
        this.clienteInfo = data?.cliente ?? null;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getRolInfo() {
    return this.ROL_META[this.usuario?.rol ?? ''] ?? { label: this.usuario?.rol, icon: '👤', color: '#6B7280' };
  }


  logout(): void {
    this.auth.logout();
  }
}

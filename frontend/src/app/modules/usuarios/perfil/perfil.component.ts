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

  logout(): void {
    this.auth.logout();
  }
}

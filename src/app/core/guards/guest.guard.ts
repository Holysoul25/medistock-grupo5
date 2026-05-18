import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rutas de invitado (login/register).
 * Si el usuario ya está autenticado, lo manda al catálogo.
 */
@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.auth.isAuthenticated) return true;
    this.router.navigate(['/productos']);
    return false;
  }
}
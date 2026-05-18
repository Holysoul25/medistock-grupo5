import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles: string[] = route.data['roles'] ?? [];
    if (roles.length === 0) return true;

    if (this.auth.hasRole(...roles)) return true;

    // Redirige al catálogo con mensaje implícito
    this.router.navigate(['/productos']);
    return false;
  }
}

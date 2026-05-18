import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent {
  constructor(public auth: AuthService) {}

  // Helpers legibles en el template
  get isAdmin()     { return this.auth.hasRole('admin'); }
  get isAnalista()  { return this.auth.hasRole('analista'); }
  get isOperador()  { return this.auth.hasRole('operador'); }
  get isEjecutivo() { return this.auth.hasRole('ejecutivo'); }
  get isCliente()   { return this.auth.hasRole('cliente'); }

  /** Muestra el ítem Pedidos a roles que interactúan con pedidos */
  get canSeePedidos() {
    return this.auth.hasRole('admin', 'ejecutivo', 'operador', 'analista', 'cliente');
  }

  /** Solo admin y analista ven Reportes */
  get canSeeReportes() {
    return this.auth.hasRole('admin', 'analista');
  }

  /** Solo admin ve gestión de usuarios */
  get canSeeAdmin() {
    return this.auth.hasRole('admin');
  }
}

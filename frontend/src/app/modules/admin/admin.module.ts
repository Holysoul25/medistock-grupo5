import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { GestionUsuariosComponent } from './usuarios/gestion-usuarios.component';

@NgModule({
  declarations: [GestionUsuariosComponent],
  imports: [SharedModule, AdminRoutingModule]
})
export class AdminModule {}

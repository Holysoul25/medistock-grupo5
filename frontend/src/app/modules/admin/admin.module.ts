import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { GestionUsuariosComponent } from './usuarios/gestion-usuarios.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [GestionUsuariosComponent],
  imports: [SharedModule, AdminRoutingModule,FormsModule]
})
export class AdminModule {}

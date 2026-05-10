import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { PerfilComponent } from './perfil/perfil.component';

@NgModule({
  declarations: [PerfilComponent],
  imports: [SharedModule, ReactiveFormsModule, UsuariosRoutingModule]
})
export class UsuariosModule {}

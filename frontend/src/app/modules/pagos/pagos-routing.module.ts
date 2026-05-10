import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmarPagoComponent } from './confirmar-pago/confirmar-pago.component';

const routes: Routes = [
  { path: 'confirmar', component: ConfirmarPagoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagosRoutingModule { }

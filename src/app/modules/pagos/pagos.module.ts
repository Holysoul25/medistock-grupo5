import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PagosRoutingModule } from './pagos-routing.module';
import { ConfirmarPagoComponent } from './confirmar-pago/confirmar-pago.component';

@NgModule({
  declarations: [ConfirmarPagoComponent],
  imports: [SharedModule, PagosRoutingModule]
})
export class PagosModule {}

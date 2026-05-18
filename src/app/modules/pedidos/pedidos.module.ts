import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PedidosRoutingModule } from './pedidos-routing.module';
import { ListaPedidosComponent } from './lista-pedidos/lista-pedidos.component';
import { DetallePedidoComponent } from './detalle-pedido/detalle-pedido.component';
import { NuevoPedidoComponent } from './nuevo-pedido/nuevo-pedido.component';

@NgModule({
  declarations: [ListaPedidosComponent, DetallePedidoComponent, NuevoPedidoComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, PedidosRoutingModule]
})
export class PedidosModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaPedidosComponent } from './lista-pedidos/lista-pedidos.component';
import { DetallePedidoComponent } from './detalle-pedido/detalle-pedido.component';
import { NuevoPedidoComponent } from './nuevo-pedido/nuevo-pedido.component';

const routes: Routes = [
  { path: '', component: ListaPedidosComponent },
  { path: 'nuevo', component: NuevoPedidoComponent },
  { path: ':id', component: DetallePedidoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { }
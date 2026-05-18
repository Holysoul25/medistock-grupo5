import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaPedidosComponent } from './lista-pedidos/lista-pedidos.component';
import { DetallePedidoComponent } from './detalle-pedido/detalle-pedido.component';
import { NuevoPedidoComponent } from './nuevo-pedido/nuevo-pedido.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: ListaPedidosComponent, canActivate: [AuthGuard] },
  { path: 'nuevo', component: NuevoPedidoComponent },   // público: login se pide al confirmar
  { path: ':id', component: DetallePedidoComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { }
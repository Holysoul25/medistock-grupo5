import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'productos',
    loadChildren: () => import('./modules/productos/productos.module').then(m => m.ProductosModule)
  },
  {
    // ✅ Una sola entrada, sin guard — el control está en pedidos-routing.module.ts
    path: 'pedidos',
    loadChildren: () => import('./modules/pedidos/pedidos.module').then(m => m.PedidosModule),
  },
  {
    path: 'pagos',
    loadChildren: () => import('./modules/pagos/pagos.module').then(m => m.PagosModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'ejecutivo', 'cliente_b2b', 'cliente_b2c', 'cliente'] }
  },
  {
    path: 'pago',
    loadChildren: () => import('./modules/pagos/pagos.module').then(m => m.PagosModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'reportes',
    loadChildren: () => import('./modules/reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'analista'] }
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./modules/usuarios/usuarios.module').then(m => m.UsuariosModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'productos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
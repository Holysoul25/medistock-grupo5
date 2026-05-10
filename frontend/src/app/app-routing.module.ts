import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    // Todos los roles autenticados
    path: 'productos',
    loadChildren: () => import('./modules/productos/productos.module').then(m => m.ProductosModule),
    canActivate: [AuthGuard]
  },
  {
    // Pedidos: todos (el componente controla qué acciones se muestran por rol)
    path: 'pedidos',
    loadChildren: () => import('./modules/pedidos/pedidos.module').then(m => m.PedidosModule),
    canActivate: [AuthGuard]
  },
  {
    // Pagos: admin, ejecutivo, cliente
    path: 'pagos',
    loadChildren: () => import('./modules/pagos/pagos.module').then(m => m.PagosModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'ejecutivo', 'cliente'] }
  },
  {
    // Alias para redirect de Webpay (token_ws llega a /pago/confirmar)
    path: 'pago',
    loadChildren: () => import('./modules/pagos/pagos.module').then(m => m.PagosModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'ejecutivo', 'cliente'] }
  },
  {
    // Reportes: admin, analista
    path: 'reportes',
    loadChildren: () => import('./modules/reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'analista'] }
  },
  {
    // Gestión de usuarios: solo admin
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    // Perfil propio: todos
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

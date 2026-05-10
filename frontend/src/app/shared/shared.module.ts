import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
  declarations: [
    StatCardComponent,
    BottomNavComponent,
    NavbarComponent,
    ToastComponent,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    StatCardComponent,
    BottomNavComponent,
    NavbarComponent,
    ToastComponent,
    CommonModule,
    RouterModule,
  ]
})
export class SharedModule {}

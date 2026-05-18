import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesDashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [ReportesDashboardComponent],
  imports: [SharedModule, ReportesRoutingModule]
})
export class ReportesModule {}

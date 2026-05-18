import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProductosRoutingModule } from './productos-routing.module';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';

@NgModule({
  declarations: [CatalogoComponent, ProductoDetalleComponent],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ProductosRoutingModule,
  ]
})
export class ProductosModule {}

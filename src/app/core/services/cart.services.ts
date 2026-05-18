import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../models/producto.model';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items$ = new BehaviorSubject<ItemCarrito[]>([]);
  cart$ = this.items$.asObservable();

  get items(): ItemCarrito[] { return this.items$.value; }
  get total(): number { return this.items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0); }
  get count(): number { return this.items.reduce((s, i) => s + i.cantidad, 0); }
  get isEmpty(): boolean { return this.items.length === 0; }

  agregar(p: Producto): void {
    const lista = [...this.items];
    const idx = lista.findIndex(i => i.producto.id_producto === p.id_producto);
    if (idx >= 0) { lista[idx] = { ...lista[idx], cantidad: lista[idx].cantidad + 1 }; }
    else { lista.push({ producto: p, cantidad: 1 }); }
    this.items$.next(lista);
  }

  quitar(p: Producto): void {
    const lista = [...this.items];
    const idx = lista.findIndex(i => i.producto.id_producto === p.id_producto);
    if (idx < 0) return;
    if (lista[idx].cantidad > 1) { lista[idx] = { ...lista[idx], cantidad: lista[idx].cantidad - 1 }; }
    else { lista.splice(idx, 1); }
    this.items$.next(lista);
  }

  cantidad(p: Producto): number {
    return this.items.find(i => i.producto.id_producto === p.id_producto)?.cantidad ?? 0;
  }

  limpiar(): void { this.items$.next([]); }
}
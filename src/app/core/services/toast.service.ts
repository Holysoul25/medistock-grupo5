import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage { text: string; type: 'success'|'error'|''; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toast = new BehaviorSubject<ToastMessage|null>(null);
  toast$ = this._toast.asObservable();

  show(text: string, type: 'success'|'error'|'' = '') {
    this._toast.next({ text, type });
    setTimeout(() => this._toast.next(null), 3200);
  }
  success(text: string) { this.show(text, 'success'); }
  error(text: string)   { this.show(text, 'error'); }
}

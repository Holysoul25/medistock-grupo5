import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast" [class.show]="msg" [class.error]="msg?.type==='error'" [class.success]="msg?.type==='success'">
      {{ msg?.text }}
    </div>`,
  styles: [`
    .toast { position:fixed; bottom:88px; left:50%; transform:translateX(-50%);
      background:var(--black); color:#fff; padding:12px 20px; border-radius:14px;
      font-size:14px; font-weight:600; z-index:300; opacity:0; transition:opacity .3s;
      white-space:nowrap; pointer-events:none; font-family:var(--font); }
    .toast.show    { opacity:1; }
    .toast.error   { background:var(--red); }
    .toast.success { background:#1a8a3a; }
  `]
})
export class ToastComponent implements OnInit {
  msg: ToastMessage | null = null;
  constructor(private toastSvc: ToastService) {}
  ngOnInit() { this.toastSvc.toast$.subscribe(m => this.msg = m); }
}

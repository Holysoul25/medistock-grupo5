import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() value = '—';
  @Input() label = '';
  @Input() dark = false;
  @Input() valueColor = '';
}

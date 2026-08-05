import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ActionButtonComponent.html',
  styleUrls: ['./ActionButtonComponent.scss'],
})
export class ActionButtonComponent {
  @Input() title = 'Ação';
  @Input() variant: 'danger' | 'primary' = 'danger';
  @Input() icon: 'delete' | 'edit' = 'delete';
  @Output() actionClick = new EventEmitter<void>();

  handleClick(): void {
    this.actionClick.emit();
  }
}

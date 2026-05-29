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
  @Output() actionClick = new EventEmitter<void>();

  handleClick(): void {
    this.actionClick.emit();
  }
}

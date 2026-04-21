import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() align: 'left' | 'center' | 'right' = 'right';

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  emitPrevious(): void {
    if (this.page > 1) {
      this.previous.emit();
    }
  }

  emitNext(): void {
    if (this.page < this.totalPages) {
      this.next.emit();
    }
  }
}
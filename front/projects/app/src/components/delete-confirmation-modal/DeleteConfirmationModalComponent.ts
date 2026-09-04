import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimpleButtonComponent } from '../simple-button/SimpleButtonComponent';
import { ImportDivergence } from '../../models/ImportDivergenceModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule, SimpleButtonComponent, TranslatePipe],
  templateUrl: './DeleteConfirmationModalComponent.html',
  styleUrls: ['./DeleteConfirmationModalComponent.scss'],
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() divergences: ImportDivergence[] = [];
  @Input() isLoading = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  handleBackdropClick(): void {
    this.cancel();
  }

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

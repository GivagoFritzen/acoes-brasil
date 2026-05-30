import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './FileInputComponent.html',
  styleUrls: ['./FileInputComponent.scss'],
})
export class FileInputComponent {
  @ViewChild('desktopInput') desktopInput?: ElementRef<HTMLInputElement>;

  @Input() label = 'Arquivo';
  @Input() placeholder = 'Nenhum arquivo selecionado';
  @Input() buttonText = 'Selecionar arquivo';
  @Input() fileName = '';
  @Input() accept = '*';
  @Input() disabled = false;

  @Output() fileSelected = new EventEmitter<File | null>();

  isDragActive = false;
  isDropSuccess = false;
  isDropError = false;
  private translationService = inject(TranslationService);
  feedbackMessage = this.translationService.get('fileInput.dragDrop');

  private successTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private errorTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private dragCounter = 0;

  openFileDialog(): void {
    if (this.disabled || !this.desktopInput) {
      return;
    }

    this.desktopInput.nativeElement.value = '';
    this.desktopInput.nativeElement.click();
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.feedbackMessage = this.getIdleFeedbackMessage();
      this.fileSelected.emit(null);
      return;
    }

    if (!this.isFileAccepted(file)) {
      this.showErrorFeedback(this.translationService.get('fileInput.invalidFileType'));
      this.fileSelected.emit(null);
      return;
    }

    this.showSuccessFeedback(file.name);
    this.fileSelected.emit(file);
  }

  handleDragOver(event: DragEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.isDragActive = true;
    this.feedbackMessage = this.translationService.get('fileInput.dropToSelect');
  }

  handleDragEnter(event: DragEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.dragCounter += 1;
    this.isDragActive = true;
    this.feedbackMessage = this.translationService.get('fileInput.dropToSelect');
  }

  handleDragLeave(event: DragEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.dragCounter = Math.max(0, this.dragCounter - 1);

    if (this.dragCounter === 0) {
      this.isDragActive = false;
      this.feedbackMessage = this.fileName ? this.translationService.get('fileInput.fileReady') : this.translationService.get('fileInput.dragDrop');
    }
  }

  handleDrop(event: DragEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.dragCounter = 0;
    this.isDragActive = false;

    const file = event.dataTransfer?.files?.[0] ?? null;

    if (!file) {
      this.showErrorFeedback(this.translationService.get('fileInput.couldNotIdentify'));
      return;
    }

    if (!this.isFileAccepted(file)) {
      this.showErrorFeedback(this.translationService.get('fileInput.invalidFileType'));
      this.fileSelected.emit(null);
      return;
    }

    this.showSuccessFeedback(file.name);
    this.fileSelected.emit(file);
  }

  ngOnDestroy(): void {
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }

    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
  }

  private showSuccessFeedback(fileName: string): void {
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }

    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
      this.errorTimeoutId = null;
    }

    this.isDropError = false;
    this.isDropSuccess = true;
    this.feedbackMessage = `${this.translationService.get('fileInput.fileSelected')}: ${fileName}`;

    this.successTimeoutId = setTimeout(() => {
      this.isDropSuccess = false;
      this.feedbackMessage = this.translationService.get('fileInput.fileReady');
    }, 1800);
  }

  private showErrorFeedback(message: string): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    this.isDropSuccess = false;
    this.isDropError = true;
    this.feedbackMessage = message;

    this.errorTimeoutId = setTimeout(() => {
      this.isDropError = false;
      this.feedbackMessage = this.getIdleFeedbackMessage();
    }, 1800);
  }

  private isFileAccepted(file: File): boolean {
    if (!this.accept || this.accept === '*') {
      return true;
    }

    const acceptedList = this.accept
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (!acceptedList.length) {
      return true;
    }

    const lowerName = file.name.toLowerCase();
    const lowerType = (file.type || '').toLowerCase();

    return acceptedList.some((accepted) => {
      if (accepted.startsWith('.')) {
        return lowerName.endsWith(accepted);
      }

      if (accepted.endsWith('/*')) {
        const typePrefix = accepted.slice(0, accepted.indexOf('/'));
        return lowerType.startsWith(`${typePrefix}/`);
      }

      return lowerType === accepted;
    });
  }

  private getIdleFeedbackMessage(): string {
    return this.fileName ? this.translationService.get('fileInput.fileReady') : this.translationService.get('fileInput.dragDrop');
  }
}
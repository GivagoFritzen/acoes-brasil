import { Directive, ElementRef, EventEmitter, Output, inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnDestroy {
  @Output() clickOutside = new EventEmitter<void>();
  
  private elementRef = inject(ElementRef);
  private document = inject(DOCUMENT);
  private clickListener: ((event: MouseEvent) => void) | null = null;

  constructor() {
    this.clickListener = this.onClick.bind(this);
    this.document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.document.removeEventListener('click', this.clickListener);
    }
  }

  private onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
}

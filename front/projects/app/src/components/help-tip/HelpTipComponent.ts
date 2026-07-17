import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './HelpTipComponent.html',
  styleUrls: ['./HelpTipComponent.scss']
})
export class HelpTipComponent {
  @Input() text: string = '';

  showTip: boolean = false;
  tooltipStyles: Record<string, string | null> = {};
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private elementRef: ElementRef) {}

  toggleTip(event: Event): void {
    event.stopPropagation();

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    if (!this.showTip && window.innerWidth < 768) {
      window.dispatchEvent(new CustomEvent('help-tip-open'));
    }

    this.showTip = !this.showTip;

    if (this.showTip && window.innerWidth >= 768) {
      this.positionTooltip();
    }
  }

  private positionTooltip(): void {
    const trigger = this.elementRef.nativeElement.querySelector('.help-tip') as HTMLElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipWidth = 250;
    const gap = 8;

    let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;

    if (left < gap) left = gap;
    if (left + tooltipWidth > window.innerWidth - gap) {
      left = window.innerWidth - tooltipWidth - gap;
    }

    this.tooltipStyles = {
      position: 'fixed',
      bottom: `${window.innerHeight - triggerRect.top + gap}px`,
      left: `${left}px`
    };
  }

  closeTip(): void {
    this.showTip = false;

    if (this.closeTimeout) clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      this.tooltipStyles = {};
      this.closeTimeout = null;
    }, 300);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeTip();
  }

  @HostListener('window:help-tip-open')
  onOtherHelpTipOpen(): void {
    this.closeTip();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowEvent(): void {
    this.closeTip();
  }
}
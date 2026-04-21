import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-tip.component.html',
  styleUrls: ['./help-tip.component.scss']
})
export class HelpTipComponent {
  @Input() text: string = '';

  showTip: boolean = false;

  toggleTip(event: Event): void {
    event.stopPropagation();
    this.showTip = !this.showTip;
  }

  @HostListener('document:click')
  closeTip(): void {
    this.showTip = false;
  }
}
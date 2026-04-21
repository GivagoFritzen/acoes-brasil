import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'cancelar';

@Component({
    selector: 'app-simple-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './simple-button.component.html',
    styleUrls: ['./simple-button.component.scss'],
})
export class SimpleButtonComponent {
    @Input() variant: ButtonVariant = 'default';
    @Input() disabled = false;
    @Output() btnClick = new EventEmitter<void>();

    handleClick(): void {
        if (this.disabled) {
            return;
        }

        this.btnClick.emit();
    }
}
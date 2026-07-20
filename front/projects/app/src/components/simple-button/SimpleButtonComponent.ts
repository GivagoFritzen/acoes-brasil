import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ButtonVariant } from '../../models/ButtonVariant';

@Component({
    selector: 'app-simple-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './SimpleButtonComponent.html',
    styleUrls: ['./SimpleButtonComponent.scss'],
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
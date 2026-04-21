import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-simple-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './simple-input.component.html',
    styleUrls: ['./simple-input.component.scss'],
})
export class SimpleInputComponent {
    private readonly ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
    private readonly CONTROL_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']);
    maxLength: number = 5;

    @Input() value: string = '';
    @Output() valueChange = new EventEmitter<string>();

    onKeyDown(event: KeyboardEvent): void {
        if (this.CONTROL_KEYS.has(event.key) || event.ctrlKey || event.metaKey) return;

        if (!this.ALPHANUMERIC_PATTERN.test(event.key)) {
            event.preventDefault();
        }
    }

    onPaste(event: ClipboardEvent): void {
        const pastedText = event.clipboardData?.getData('text') ?? '';

        if (!this.ALPHANUMERIC_PATTERN.test(pastedText)) {
            event.preventDefault();
        }
    }

    onInput(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-simple-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './SimpleInputComponent.html',
    styleUrls: ['./SimpleInputComponent.scss'],
})
export class SimpleInputComponent {
    private readonly ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
    private readonly CONTROL_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']);

    @Input() value: string = '';
    @Input() maxLength?: number | null;
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() allowOnlyAlphanumeric: boolean = false;
    @Output() valueChange = new EventEmitter<string>();

    onKeyDown(event: KeyboardEvent): void {
        if (this.CONTROL_KEYS.has(event.key) || event.ctrlKey || event.metaKey) return;

        if (this.allowOnlyAlphanumeric && !this.ALPHANUMERIC_PATTERN.test(event.key)) {
            event.preventDefault();
        }
    }

    onPaste(event: ClipboardEvent): void {
        if (!this.allowOnlyAlphanumeric) return;

        const pastedText = event.clipboardData?.getData('text') ?? '';

        if (!this.ALPHANUMERIC_PATTERN.test(pastedText)) {
            event.preventDefault();
        }
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let nextValue = input.value;

        if (this.maxLength != null && this.maxLength > 0 && nextValue.length > this.maxLength) {
            nextValue = nextValue.slice(0, this.maxLength);
            input.value = nextValue;
        }

        this.valueChange.emit(nextValue);
    }
}
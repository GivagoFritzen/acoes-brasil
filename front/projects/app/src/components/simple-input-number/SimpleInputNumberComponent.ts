import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-simple-input-number',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './SimpleInputNumberComponent.html',
    styleUrls: ['./SimpleInputNumberComponent.scss'],
})
export class SimpleInputNumberComponent {
    private readonly CONTROL_KEYS = new Set([
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Home',
        'End',
    ]);

    @Input() value = '';
    @Input() allowDecimal = true;
    @Input() allowNegative = false;
    @Input() maxLength: number | null = null;

    @Output() valueChange = new EventEmitter<string>();

    onKeyDown(event: KeyboardEvent): void {
        if (this.CONTROL_KEYS.has(event.key) || event.ctrlKey || event.metaKey) return;

        const input = event.target as HTMLInputElement;
        const currentValue = input.value;

        if (/^[0-9]$/.test(event.key)) return;

        if (
            this.allowDecimal &&
            (event.key === '.' || event.key === ',') &&
            !currentValue.includes('.') &&
            !currentValue.includes(',')
        ) {
            return;
        }

        if (this.allowNegative && event.key === '-' && !currentValue.includes('-') && input.selectionStart === 0) {
            return;
        }

        event.preventDefault();
    }

    onPaste(event: ClipboardEvent): void {
        const pastedText = (event.clipboardData?.getData('text') ?? '').trim();
        const decimalPart = this.allowDecimal ? '([\.,][0-9]+)?' : '';
        const negativePart = this.allowNegative ? '-?' : '';
        const pattern = new RegExp(`^${negativePart}[0-9]+${decimalPart}$`);

        if (!pattern.test(pastedText)) {
            event.preventDefault();
        }
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value;

        value = value.replace(/[^\d.,-]/g, '');

        if (!this.allowNegative) {
            value = value.replace(/-/g, '');
        } else {
            value = value.replace(/(?!^)-/g, '');
        }

        if (!this.allowDecimal) {
            value = value.replace(/[.,]/g, '');
        } else {
            value = value.replace(/([.,])(?=.*[.,])/g, '');
        }

        input.value = value;
        this.valueChange.emit(value.replace(',', '.'));
    }
}
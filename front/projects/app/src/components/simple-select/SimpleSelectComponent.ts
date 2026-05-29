import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectOption } from '../../../../../../common/models/SelectOptionModel';

@Component({
    selector: 'app-simple-select',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './SimpleSelectComponent.html',
    styleUrls: ['./SimpleSelectComponent.scss'],
})
export class SimpleSelectComponent {
    @Input() options: SelectOption[] = [];
    @Input() value: string = '';
    @Input() placeholder: string = 'Selecione...';
    @Input() disabled = false;

    @Output() valueChange = new EventEmitter<string>();

    onChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        this.valueChange.emit(selectElement.value);
    }
}
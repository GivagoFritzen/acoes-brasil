import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectOption } from '../../../../../../common/models/select-option.model';

@Component({
    selector: 'app-simple-select',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './simple-select.component.html',
    styleUrls: ['./simple-select.component.scss'],
})
export class SimpleSelectComponent {
    @Input() options: SelectOption[] = [];
    @Input() value: string = '';
    @Input() placeholder: string = 'Selecione...';

    @Output() valueChange = new EventEmitter<string>();

    onChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        this.valueChange.emit(selectElement.value);
    }
}
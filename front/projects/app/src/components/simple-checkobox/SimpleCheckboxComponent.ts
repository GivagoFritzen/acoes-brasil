import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-simple-checkbox',
  templateUrl: './SimpleCheckboxComponent.html',
  styleUrls: ['./SimpleCheckboxComponent.scss']
})
export class SimpleCheckboxComponent {
  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checkedChange.emit(isChecked);
  }
}

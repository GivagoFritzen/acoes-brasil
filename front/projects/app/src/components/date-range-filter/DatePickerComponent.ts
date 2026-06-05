import { Component, ElementRef, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localePt from '@angular/common/locales/pt';
import { CalendarDay } from '../../models/CalendarDayModel';

registerLocaleData(localePt);

@Component({
    selector: 'app-date-picker',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [DatePipe],
    templateUrl: './DatePickerComponent.html',
    styleUrls: ['./DatePickerComponent.scss']
})
export class DatePickerComponent implements OnChanges {
    @Input() value: string = '';
    @Input() disableFutureDates = false;
    @Output() dateChange = new EventEmitter<string>();

    isOpen = false;
    selectedDate: Date | null = null;
    tempSelectedDate: Date | null = null;
    currentMonth: Date = new Date();
    inputValue: string = '';

    weekDays = ['do', 'se', 'te', 'qu', 'qu', 'se', 'sá'];
    daysInMonth: CalendarDay[] = [];

    constructor(private eRef: ElementRef) {
        this.generateCalendar();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']) {
            const newValue = changes['value'].currentValue;
            if (!newValue) {
                this.selectedDate = null;
                this.tempSelectedDate = null;
                this.inputValue = '';
            } else {
                this.parseInitialValue(newValue);
            }
        }
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event): void {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    toggleDatePicker(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.tempSelectedDate = this.selectedDate ? new Date(this.selectedDate) : null;
            this.currentMonth = this.tempSelectedDate ? new Date(this.tempSelectedDate) : new Date();
            this.formatInputValue(this.tempSelectedDate);
            this.generateCalendar();
        }
    }

    changeMonth(delta: number): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + delta, 1);
        this.generateCalendar();
    }

    generateCalendar(): void {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const days: CalendarDay[] = [];

        const firstDayIndex = firstDayOfMonth.getDay();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
        }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        this.daysInMonth = days;
    }

    selectTempDate(day: CalendarDay): void {
        if (this.disableFutureDates && this.isFutureDate(day.date)) {
            return;
        }

        this.tempSelectedDate = day.date;
        this.formatInputValue(day.date);
        if (!day.isCurrentMonth) {
            this.currentMonth = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
            this.generateCalendar();
        }
    }

    selectToday(): void {
        const today = new Date();
        this.tempSelectedDate = today;
        this.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.formatInputValue(today);
        this.generateCalendar();
    }

    formatInputValue(date: Date | null): void {
        if (!date) {
            this.inputValue = '';
            return;
        }
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        this.inputValue = `${d}/${m}/${y}`;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey || event.metaKey) return;
        const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowed.includes(event.key)) return;
        if (/^[0-9]$/.test(event.key)) return;
        event.preventDefault();
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const digits = input.value.replace(/[^0-9]/g, '').slice(0, 8);

        let masked = digits;
        if (digits.length > 4) {
            masked = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
        } else if (digits.length > 2) {
            masked = `${digits.substring(0, 2)}/${digits.substring(2)}`;
        }

        if (masked !== input.value) {
            input.value = masked;
        }
    }

    onInputTyping(value: string): void {
        const cleanValue = value.replace(/\//g, '');
        const match = cleanValue.match(/^(\d{2})(\d{2})(\d{4})$/);

        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const year = parseInt(match[3], 10);
            const parsedDate = new Date(year, month, day);

            if (parsedDate.getFullYear() === year && parsedDate.getMonth() === month && parsedDate.getDate() === day) {
                if (this.disableFutureDates && this.isFutureDate(parsedDate)) {
                    return;
                }
                this.tempSelectedDate = parsedDate;
                this.currentMonth = new Date(year, month, 1);
                this.generateCalendar();
            }
        }
    }

    isTempSelected(date: Date): boolean {
        if (!this.tempSelectedDate) return false;
        return date.toDateString() === this.tempSelectedDate.toDateString();
    }

    isToday(date: Date): boolean {
        return date.toDateString() === new Date().toDateString();
    }

    apply(): void {
        if (this.tempSelectedDate && this.disableFutureDates && this.isFutureDate(this.tempSelectedDate)) {
            return;
        }

        this.selectedDate = this.tempSelectedDate;
        this.isOpen = false;

        if (this.selectedDate) {
            const y = this.selectedDate.getFullYear();
            const m = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const d = this.selectedDate.getDate().toString().padStart(2, '0');
            this.dateChange.emit(`${y}-${m}-${d}`);
        } else {
            this.dateChange.emit('');
        }
    }

    cancel(): void {
        this.isOpen = false;
        this.tempSelectedDate = this.selectedDate;
    }

    isFutureDate(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const candidate = new Date(date);
        candidate.setHours(0, 0, 0, 0);
        return candidate.getTime() > today.getTime();
    }

    private parseInitialValue(val: string): void {
        const parts = val.split('-');
        if (parts.length === 3) {
            const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            this.selectedDate = date;
            this.tempSelectedDate = date;
            this.formatInputValue(date);
        }
    }
}
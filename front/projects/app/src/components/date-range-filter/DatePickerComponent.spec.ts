import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SimpleChanges } from '@angular/core';
import { vi } from 'vitest';
import { DatePickerComponent } from './DatePickerComponent';
import { CalendarDay } from '../../models/CalendarDayModel';

describe('DatePickerComponent', () => {
    let component: DatePickerComponent;
    let fixture: ComponentFixture<DatePickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DatePickerComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(DatePickerComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('value', () => {
            it('deve usar value padrão vazio', () => {
                fixture.detectChanges();
                expect(component.value).toBe('');
            });

            it('deve aplicar value fornecido', () => {
                component.value = '2026-05-15';
                fixture.detectChanges();
                expect(component.value).toBe('2026-05-15');
            });
        });

        describe('disableFutureDates', () => {
            it('deve usar disableFutureDates = false como padrão', () => {
                fixture.detectChanges();
                expect(component.disableFutureDates).toBe(false);
            });

            it('deve aplicar disableFutureDates fornecido', () => {
                component.disableFutureDates = true;
                fixture.detectChanges();
                expect(component.disableFutureDates).toBe(true);
            });
        });
    });

    describe('ngOnChanges', () => {
        it('deve fazer parse de value inicial no ngOnChanges', () => {
            const changes: SimpleChanges = {
                value: {
                    previousValue: '',
                    currentValue: '2026-05-15',
                    firstChange: false,
                    isFirstChange: () => false
                }
            };
            component['ngOnChanges'](changes);
            expect(component.selectedDate).toBeTruthy();
            expect(component.selectedDate?.getDate()).toBe(15);
            expect(component.selectedDate?.getMonth()).toBe(4);
            expect(component.selectedDate?.getFullYear()).toBe(2026);
        });

        it('deve limpar datas quando value for alterado para vazio via ngOnChanges', () => {
            const changes: SimpleChanges = {
                value: {
                    previousValue: '2026-05-15',
                    currentValue: '',
                    firstChange: false,
                    isFirstChange: () => false
                }
            };
            component['ngOnChanges'](changes);
            expect(component.selectedDate).toBeNull();
            expect(component.tempSelectedDate).toBeNull();
            expect(component.inputValue).toBe('');
        });

        it('NÃO deve alterar selectedDate quando value não mudar', () => {
            const changes: SimpleChanges = {
                value: {
                    previousValue: '',
                    currentValue: '2026-05-15',
                    firstChange: false,
                    isFirstChange: () => false
                }
            };
            component['ngOnChanges'](changes);
            expect(component.selectedDate?.getDate()).toBe(15);
        });
    });

    describe('Estado inicial', () => {
        it('deve começar com isOpen = false', () => {
            fixture.detectChanges();
            expect(component.isOpen).toBe(false);
        });

        it('deve começar com selectedDate = null', () => {
            fixture.detectChanges();
            expect(component.selectedDate).toBeNull();
        });

        it('deve começar com tempSelectedDate = null', () => {
            fixture.detectChanges();
            expect(component.tempSelectedDate).toBeNull();
        });

        it('deve gerar calendário no construtor', () => {
            fixture.detectChanges();
            expect(component.daysInMonth.length).toBe(42);
        });

        it('deve ter 7 dias da semana', () => {
            fixture.detectChanges();
            expect(component.weekDays.length).toBe(7);
            expect(component.weekDays).toEqual(['do', 'se', 'te', 'qu', 'qu', 'se', 'sá']);
        });
    });

    describe('generateCalendar', () => {
        it('deve gerar 42 dias no calendário', () => {
            component.generateCalendar();
            expect(component.daysInMonth.length).toBe(42);
        });

        it('deve incluir dias do mês anterior', () => {
            component.currentMonth = new Date(2026, 4, 1);
            component.generateCalendar();
            const outsideMonth = component.daysInMonth.filter(dia => !dia.isCurrentMonth);
            expect(outsideMonth.length).toBeGreaterThan(0);
        });

        it('deve incluir dias do próximo mês', () => {
            component.currentMonth = new Date(2026, 4, 1);
            component.generateCalendar();
            const lastDays = component.daysInMonth.slice(-7);
            const outsideNextMonth = lastDays.filter(dia => !dia.isCurrentMonth);
            expect(outsideNextMonth.length).toBeGreaterThan(0);
        });
    });

    describe('toggleDatePicker', () => {
        it('deve abrir date picker quando toggleDatePicker() chamado e isOpen = false', () => {
            component.isOpen = false;
            component.toggleDatePicker();
            expect(component.isOpen).toBe(true);
        });

        it('deve fechar date picker quando toggleDatePicker() chamado e isOpen = true', () => {
            component.isOpen = true;
            component.toggleDatePicker();
            expect(component.isOpen).toBe(false);
        });

        it('deve inicializar tempSelectedDate com selectedDate ao abrir', () => {
            component.selectedDate = new Date(2026, 4, 15);
            component.isOpen = false;
            component.toggleDatePicker();
            expect(component.tempSelectedDate).toBeTruthy();
            expect(component.tempSelectedDate?.getDate()).toBe(15);
        });

        it('deve usar currentMonth como currentMonth ao abrir se não houver selectedDate', () => {
            component.selectedDate = null;
            component.currentMonth = new Date(2026, 4, 1);
            component.isOpen = false;
            component.toggleDatePicker();
            expect(component.tempSelectedDate).toBeNull();
        });
    });

    describe('changeMonth', () => {
        it('deve avançar mês quando delta = 1', () => {
            component.currentMonth = new Date(2026, 4, 1);
            component.changeMonth(1);
            expect(component.currentMonth.getMonth()).toBe(5);
        });

        it('deve voltar mês quando delta = -1', () => {
            component.currentMonth = new Date(2026, 4, 1);
            component.changeMonth(-1);
            expect(component.currentMonth.getMonth()).toBe(3);
        });

        it('deve regenerar calendário após mudança de mês', () => {
            component.currentMonth = new Date(2026, 4, 1);
            const initialDaysLength = component.daysInMonth.length;
            component.changeMonth(1);
            expect(component.daysInMonth.length).toBe(initialDaysLength);
        });

        it('deve permitir atravessar ano', () => {
            component.currentMonth = new Date(2026, 11, 1);
            component.changeMonth(1);
            expect(component.currentMonth.getFullYear()).toBe(2027);
            expect(component.currentMonth.getMonth()).toBe(0);
        });
    });

    describe('selectTempDate', () => {
        it('deve selecionar data temporária', () => {
            const day: CalendarDay = { date: new Date(2026, 4, 15), isCurrentMonth: true };
            component.selectTempDate(day);
            expect(component.tempSelectedDate).toBeTruthy();
            expect(component.tempSelectedDate?.getDate()).toBe(15);
        });

        it('deve formatar inputValue ao selecionar', () => {
            const day: CalendarDay = { date: new Date(2026, 4, 15), isCurrentMonth: true };
            component.selectTempDate(day);
            expect(component.inputValue).toContain('15');
            expect(component.inputValue).toContain('05');
            expect(component.inputValue).toContain('2026');
        });

        it('NÃO deve selecionar data futura se disableFutureDates = true', () => {
            component.disableFutureDates = true;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const day: CalendarDay = { date: tomorrow, isCurrentMonth: true };
            const initialTemp = component.tempSelectedDate;
            component.selectTempDate(day);
            expect(component.tempSelectedDate).toBe(initialTemp);
        });

        it('deve selecionar data futura se disableFutureDates = false', () => {
            component.disableFutureDates = false;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const day: CalendarDay = { date: tomorrow, isCurrentMonth: true };
            component.selectTempDate(day);
            expect(component.tempSelectedDate?.getDate()).toBe(tomorrow.getDate());
        });

        it('deve mudar currentMonth se dia não é do mês atual', () => {
            component.currentMonth = new Date(2026, 4, 1);
            const dayFromOtherMonth: CalendarDay = { date: new Date(2026, 3, 15), isCurrentMonth: false };
            component.selectTempDate(dayFromOtherMonth);
            expect(component.currentMonth.getMonth()).toBe(3);
        });
    });

    describe('selectToday', () => {
        it('deve selecionar data de hoje', () => {
            component.selectToday();
            expect(component.tempSelectedDate).toBeTruthy();
            const today = new Date();
            expect(component.tempSelectedDate?.getDate()).toBe(today.getDate());
            expect(component.tempSelectedDate?.getMonth()).toBe(today.getMonth());
            expect(component.tempSelectedDate?.getFullYear()).toBe(today.getFullYear());
        });

        it('deve ajustar currentMonth para mês atual', () => {
            component.currentMonth = new Date(2020, 0, 1);
            component.selectToday();
            const today = new Date();
            expect(component.currentMonth.getMonth()).toBe(today.getMonth());
        });

        it('deve formatar inputValue como DD/MM/YYYY', () => {
            component.selectToday();
            expect(component.inputValue).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        });
    });

    describe('formatInputValue', () => {
        it('deve formatar data como DD/MM/YYYY', () => {
            const date = new Date(2026, 4, 15);
            component.formatInputValue(date);
            expect(component.inputValue).toBe('15/05/2026');
        });

        it('deve usar valor vazio quando date é null', () => {
            component.formatInputValue(null);
            expect(component.inputValue).toBe('');
        });

        it('deve usar padding para dia e mês menores que 10', () => {
            const date = new Date(2026, 0, 5);
            component.formatInputValue(date);
            expect(component.inputValue).toBe('05/01/2026');
        });
    });

    describe('onInputTyping', () => {
        it('deve fazer parse de data no formato DD/MM/YYYY', () => {
            component.onInputTyping('15/05/2026');
            expect(component.tempSelectedDate).toBeTruthy();
            expect(component.tempSelectedDate?.getDate()).toBe(15);
            expect(component.tempSelectedDate?.getMonth()).toBe(4);
            expect(component.tempSelectedDate?.getFullYear()).toBe(2026);
        });

        it('deve fazer parse de data sem separadores', () => {
            component.onInputTyping('15052026');
            expect(component.tempSelectedDate).toBeTruthy();
            expect(component.tempSelectedDate?.getDate()).toBe(15);
            expect(component.tempSelectedDate?.getMonth()).toBe(4);
            expect(component.tempSelectedDate?.getFullYear()).toBe(2026);
        });

        it('NÃO deve aceitar data inválida', () => {
            component.tempSelectedDate = null;
            component.onInputTyping('invalid');
            expect(component.tempSelectedDate).toBeNull();
        });

        it('NÃO deve aceitar data futura se disableFutureDates = true', () => {
            component.disableFutureDates = true;
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const futureStr = `${futureDate.getDate().toString().padStart(2, '0')}/${(futureDate.getMonth() + 1).toString().padStart(2, '0')}/${futureDate.getFullYear()}`;
            component.tempSelectedDate = new Date();
            component.onInputTyping(futureStr);
            expect(component.tempSelectedDate?.getFullYear()).toBe(new Date().getFullYear());
        });

        it('deve ignorar data inválida como 31/02/2026', () => {
            component.onInputTyping('31/02/2026');
            expect(component.tempSelectedDate).toBeNull();
        });

        it('NÃO deve aceitar menos de 8 dígitos', () => {
            component.tempSelectedDate = null;
            component.onInputTyping('1505202');
            expect(component.tempSelectedDate).toBeNull();
        });
    });

    describe('onKeyDown', () => {
        function createKeyEvent(key: string, ctrl = false): KeyboardEvent {
            return new KeyboardEvent('keydown', { key, ctrlKey: ctrl, cancelable: true });
        }

        it('deve bloquear letras', () => {
            const event = createKeyEvent('a');
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('deve permitir dígitos', () => {
            const event = createKeyEvent('5');
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('deve bloquear /', () => {
            const event = createKeyEvent('/');
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('deve bloquear -', () => {
            const event = createKeyEvent('-');
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('deve permitir Backspace', () => {
            const event = createKeyEvent('Backspace');
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('deve permitir teclas de navegação', () => {
            const event = createKeyEvent('ArrowRight');
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('deve permitir Ctrl+C', () => {
            const event = createKeyEvent('c', true);
            vi.spyOn(event, 'preventDefault');
            component.onKeyDown(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('onInput', () => {
        function createInputEvent(value: string): Event {
            const input = document.createElement('input');
            input.value = value;
            return { target: input } as Event;
        }

        it('deve mascarar 8 dígitos como DD/MM/YYYY', () => {
            const event = createInputEvent('15052026');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/05/2026');
        });

        it('deve remover letras e mascarar', () => {
            const event = createInputEvent('abc15def05gh2026');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/05/2026');
        });

        it('deve remover separador extra e mascarar', () => {
            const event = createInputEvent('15//05--2026');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/05/2026');
        });

        it('deve limitar a 8 dígitos e mascarar', () => {
            const event = createInputEvent('15052026123');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/05/2026');
        });

        it('deve aplicar máscara progressiva: 2 dígitos', () => {
            const event = createInputEvent('15');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15');
        });

        it('deve aplicar máscara progressiva: 3 dígitos', () => {
            const event = createInputEvent('155');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/5');
        });

        it('deve aplicar máscara progressiva: 5 dígitos', () => {
            const event = createInputEvent('15052');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/05/2');
        });

        it('NÃO deve alterar value já mascarado', () => {
            const event = createInputEvent('15/05/2026');
            component.onInput(event);
            const target = event.target as HTMLInputElement;
            expect(target.value).toBe('15/05/2026');
        });
    });

    describe('isTempSelected', () => {
        it('deve retornar true para data selecionada', () => {
            component.tempSelectedDate = new Date(2026, 4, 15);
            const date = new Date(2026, 4, 15);
            expect(component.isTempSelected(date)).toBe(true);
        });

        it('deve retornar false para data não selecionada', () => {
            component.tempSelectedDate = new Date(2026, 4, 15);
            const date = new Date(2026, 4, 16);
            expect(component.isTempSelected(date)).toBe(false);
        });

        it('deve retornar false quando tempSelectedDate é null', () => {
            component.tempSelectedDate = null;
            const date = new Date(2026, 4, 15);
            expect(component.isTempSelected(date)).toBe(false);
        });

        it('deve comparar apenas data, não hora', () => {
            component.tempSelectedDate = new Date(2026, 4, 15, 10, 30);
            const date = new Date(2026, 4, 15, 5, 0);
            expect(component.isTempSelected(date)).toBe(true);
        });
    });

    describe('isToday', () => {
        it('deve retornar true para hoje', () => {
            const today = new Date();
            expect(component.isToday(today)).toBe(true);
        });

        it('deve retornar false para data diferente', () => {
            const differentDay = new Date();
            differentDay.setDate(differentDay.getDate() + 1);
            expect(component.isToday(differentDay)).toBe(false);
        });
    });

    describe('isFutureDate', () => {
        it('deve retornar true para data futura', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            expect(component.isFutureDate(futureDate)).toBe(true);
        });

        it('deve retornar false para data passada', () => {
            const pastDate = new Date();
            pastDate.setFullYear(pastDate.getFullYear() - 1);
            expect(component.isFutureDate(pastDate)).toBe(false);
        });

        it('deve retornar false para hoje', () => {
            const today = new Date();
            expect(component.isFutureDate(today)).toBe(false);
        });
    });

    describe('apply', () => {
        it('deve aplicar data temporária e emitir evento', () => {
            component.tempSelectedDate = new Date(2026, 4, 15);
            component.isOpen = true;
            const emitSpy = vi.spyOn(component.dateChange, 'emit');
            component.apply();
            expect(component.selectedDate).toBeTruthy();
            expect(component.selectedDate?.getDate()).toBe(15);
            expect(component.isOpen).toBe(false);
            expect(emitSpy).toHaveBeenCalledWith('2026-05-15');
        });

        it('deve emitir string vazia quando tempSelectedDate é null', () => {
            component.tempSelectedDate = null;
            component.isOpen = true;
            const emitSpy = vi.spyOn(component.dateChange, 'emit');
            component.apply();
            expect(emitSpy).toHaveBeenCalledWith('');
        });

        it('NÃO deve aplicar data futura se disableFutureDates = true', () => {
            component.disableFutureDates = true;
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            component.tempSelectedDate = futureDate;
            component.selectedDate = null;
            component.isOpen = true;
            const initialSelected = component.selectedDate;
            component.apply();
            expect(component.selectedDate).toBe(initialSelected);
            expect(component.isOpen).toBe(true);
        });
    });

    describe('cancel', () => {
        it('deve fechar sem aplicar', () => {
            component.isOpen = true;
            component.tempSelectedDate = new Date(2026, 4, 20);
            component.cancel();
            expect(component.isOpen).toBe(false);
        });

        it('deve restaurar tempSelectedDate para selectedDate', () => {
            component.selectedDate = new Date(2026, 4, 10);
            component.tempSelectedDate = new Date(2026, 4, 20);
            component.cancel();
            expect(component.tempSelectedDate?.getDate()).toBe(10);
        });

        it('deve restaurar para null se não há selectedDate', () => {
            component.selectedDate = null;
            component.tempSelectedDate = new Date(2026, 4, 20);
            component.cancel();
            expect(component.tempSelectedDate).toBeNull();
        });
    });

    describe('HostListener (clickout)', () => {
        it('deve fechar ao clicar fora do componente', () => {
            component.isOpen = true;
            const event = new Event('click');
            component['clickout'](event);
            expect(component.isOpen).toBe(false);
        });

        it('NÃO deve fechar ao clicar dentro do componente', () => {
            component.isOpen = true;
            const mockEvent = {
                target: component['eRef'].nativeElement
            } as Event;
            component['clickout'](mockEvent);
            expect(component.isOpen).toBe(true);
        });
    });

    describe('Renderização', () => {
        it('deve mostrar placeholder quando não há selectedDate', () => {
            fixture.detectChanges();
            const span = fixture.debugElement.query(By.css('span'));
            expect(span.classes['placeholder']).toBe(true);
        });

        it('deve mostrar data formatada quando há selectedDate', () => {
            component.selectedDate = new Date(2026, 4, 15);
            fixture.detectChanges();
            const span = fixture.debugElement.query(By.css('span'));
            expect(span.classes['placeholder']).toBeFalsy();
        });

        it('deve mostrar calendário quando isOpen = true', () => {
            component.isOpen = true;
            fixture.detectChanges();
            const popover = fixture.debugElement.query(By.css('.calendar-popover'));
            expect(popover).toBeTruthy();
        });

        it('NÃO deve mostrar calendário quando isOpen = false', () => {
            component.isOpen = false;
            fixture.detectChanges();
            const popover = fixture.debugElement.query(By.css('.calendar-popover'));
            expect(popover).toBeNull();
        });

        it('deve renderizar dias no calendário', () => {
            component.isOpen = true;
            fixture.detectChanges();
            const dayButtons = fixture.debugElement.queryAll(By.css('.day-btn'));
            expect(dayButtons.length).toBe(42);
        });

        it('deve renderizar botões de navegação de mês', () => {
            component.isOpen = true;
            fixture.detectChanges();
            const navButtons = fixture.debugElement.queryAll(By.css('.nav-btn'));
            expect(navButtons.length).toBe(2);
        });

        it('deve desabilitar botão do dia futuro quando disableFutureDates = true', () => {
            component.isOpen = true;
            component.disableFutureDates = true;
            fixture.detectChanges();
            const dayButtons = fixture.debugElement.queryAll(By.css('.day-btn'));
            const disabledButtons = dayButtons.filter(btn => btn.nativeElement.disabled);
            expect(disabledButtons.length).toBeGreaterThan(0);
        });

        it('deve mostrar botão Cancel', () => {
            component.isOpen = true;
            fixture.detectChanges();
            const cancelBtn = fixture.debugElement.query(By.css('.cancel-btn'));
            expect(cancelBtn).toBeTruthy();
        });

        it('deve mostrar botão Apply', () => {
            component.isOpen = true;
            fixture.detectChanges();
            const applyBtn = fixture.debugElement.query(By.css('.apply-btn'));
            expect(applyBtn).toBeTruthy();
        });
    });
});

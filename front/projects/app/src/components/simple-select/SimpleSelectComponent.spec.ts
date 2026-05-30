import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SimpleSelectComponent } from './SimpleSelectComponent';

interface SelectOption {
    value: string;
    label: string;
}

describe('SimpleSelectComponent', () => {
    let component: SimpleSelectComponent;
    let fixture: ComponentFixture<SimpleSelectComponent>;

    const mockOptions: SelectOption[] = [
        { value: 'opt1', label: 'Opção 1' },
        { value: 'opt2', label: 'Opção 2' },
        { value: 'opt3', label: 'Opção 3' },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleSelectComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleSelectComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('options', () => {
            it('deve usar options vazio como padrão', () => {
                fixture.detectChanges();
                expect(component.options).toEqual([]);
            });

            it('deve aplicar options fornecido', () => {
                component.options = mockOptions as any;
                fixture.detectChanges();
                expect(component.options).toEqual(mockOptions);
            });

            it('deve renderizar options no select', () => {
                component.options = mockOptions as any;
                fixture.detectChanges();
                const options = fixture.debugElement.queryAll(By.css('option'));
                // +1 because of placeholder option
                expect(options.length).toBe(mockOptions.length + 1);
            });

            it('deve renderizar labels das options corretamente', () => {
                component.options = mockOptions as any;
                fixture.detectChanges();
                const optionElements = fixture.debugElement.queryAll(By.css('option:not([value=""])'));
                expect(optionElements[0].nativeElement.textContent.trim()).toBe('Opção 1');
                expect(optionElements[1].nativeElement.textContent.trim()).toBe('Opção 2');
                expect(optionElements[2].nativeElement.textContent.trim()).toBe('Opção 3');
            });
        });

        describe('value', () => {
            it('deve usar value padrão vazio', () => {
                fixture.detectChanges();
                expect(component.value).toBe('');
            });

            it('deve aplicar value fornecido', () => {
                component.value = 'opt2';
                fixture.detectChanges();
                expect(component.value).toBe('opt2');
            });
        });

        describe('placeholder', () => {
            it('deve usar placeholder padrão Selecione...', () => {
                fixture.detectChanges();
                expect(component.placeholder).toBe('Selecione...');
            });

            it('deve aplicar placeholder fornecido', () => {
                component.placeholder = 'Escolha uma opção';
                fixture.detectChanges();
                expect(component.placeholder).toBe('Escolha uma opção');
            });

            it('deve renderizar placeholder como primeira option vazia', () => {
                component.placeholder = 'Escolha...';
                fixture.detectChanges();
                const firstOption = fixture.debugElement.query(By.css('option[value=""]')).nativeElement;
                expect(firstOption.textContent.trim()).toBe('Escolha...');
            });
        });

        describe('disabled', () => {
            it('deve usar disabled = false como padrão', () => {
                fixture.detectChanges();
                expect(component.disabled).toBe(false);
            });

            it('deve aplicar disabled = true', () => {
                component.disabled = true;
                fixture.detectChanges();
                expect(component.disabled).toBe(true);
            });

            it('deve desabilitar select quando disabled = true', () => {
                component.disabled = true;
                fixture.detectChanges();
                const select = fixture.debugElement.query(By.css('select')).nativeElement;
                expect(select.disabled).toBe(true);
            });
        });
    });

    describe('Outputs', () => {
        it('deve emitir valueChange com valor selecionado no onChange()', () => {
            component.options = mockOptions as any;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.valueChange, 'emit');
            const select = fixture.debugElement.query(By.css('select')).nativeElement;
            select.value = 'opt2';
            const event = { target: select } as unknown as Event;
            component.onChange(event);
            expect(emitSpy).toHaveBeenCalledWith('opt2');
        });

        

        it('deve emitir valueChange via evento change do select', () => {
            component.options = mockOptions as any;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.valueChange, 'emit');
            const select = fixture.debugElement.query(By.css('select')).nativeElement;
            select.value = 'opt3';
            select.dispatchEvent(new Event('change'));
            expect(emitSpy).toHaveBeenCalledWith('opt3');
        });
    });

    describe('Métodos', () => {
        it('deve emitir valueChange com valor vazio quando placeholder selecionado', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.valueChange, 'emit');
            const select = fixture.debugElement.query(By.css('select')).nativeElement;
            select.value = '';
            const event = { target: select } as unknown as Event;
            component.onChange(event);
            expect(emitSpy).toHaveBeenCalledWith('');
        });
    });
});

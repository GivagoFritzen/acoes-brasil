import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SimpleInputNumberComponent } from './SimpleInputNumberComponent';

describe('SimpleInputNumberComponent', () => {
    let component: SimpleInputNumberComponent;
    let fixture: ComponentFixture<SimpleInputNumberComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleInputNumberComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleInputNumberComponent);
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
                component.value = '123';
                fixture.detectChanges();
                expect(component.value).toBe('123');
            });

            it('deve renderizar value no input', () => {
                component.value = '456';
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                expect(input.value).toBe('456');
            });
        });

        describe('allowDecimal', () => {
            it('deve usar allowDecimal = true como padrão', () => {
                fixture.detectChanges();
                expect(component.allowDecimal).toBe(true);
            });

            it('deve aplicar allowDecimal = false', () => {
                component.allowDecimal = false;
                fixture.detectChanges();
                expect(component.allowDecimal).toBe(false);
            });
        });

        describe('allowNegative', () => {
            it('deve usar allowNegative = false como padrão', () => {
                fixture.detectChanges();
                expect(component.allowNegative).toBe(false);
            });

            it('deve aplicar allowNegative = true', () => {
                component.allowNegative = true;
                fixture.detectChanges();
                expect(component.allowNegative).toBe(true);
            });
        });

        describe('maxLength', () => {
            it('deve usar maxLength padrão null', () => {
                fixture.detectChanges();
                expect(component.maxLength).toBeNull();
            });

            it('deve aplicar maxLength fornecido', () => {
                component.maxLength = 10;
                fixture.detectChanges();
                expect(component.maxLength).toBe(10);
            });
        });
    });

    describe('Outputs', () => {
        it('deve emitir valueChange com valor correto no onInput', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.valueChange, 'emit');
            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            input.value = '123';
            const event = { target: input } as unknown as Event;
            component.onInput(event);
            expect(emitSpy).toHaveBeenCalledWith('123');
        });

        it('deve emitir valueChange com ponto decimal no onInput quando vírgula usada', () => {
            component.allowDecimal = true;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.valueChange, 'emit');
            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            input.value = '12,34';
            const event = { target: input } as unknown as Event;
            component.onInput(event);
            expect(emitSpy).toHaveBeenCalledWith('12.34');
        });
    });

    describe('Métodos', () => {
        describe('onKeyDown', () => {
            function createKeyDownEvent(key: string, inputValue = '', selectionStart = 0) {
                const input = document.createElement('input');
                input.value = inputValue;
                Object.defineProperty(input, 'selectionStart', { value: selectionStart, configurable: true });
                const preventDefault = vi.fn();
                const event = {
                    key,
                    ctrlKey: false,
                    metaKey: false,
                    target: input,
                    preventDefault,
                } as unknown as KeyboardEvent;
                return { event, preventDefault };
            }

            it('deve permitir dígitos', () => {
                const { event, preventDefault } = createKeyDownEvent('5');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir letras', () => {
                const { event, preventDefault } = createKeyDownEvent('a');
                component.onKeyDown(event);
                expect(preventDefault).toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (Backspace)', () => {
                const { event, preventDefault } = createKeyDownEvent('Backspace');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (Delete)', () => {
                const { event, preventDefault } = createKeyDownEvent('Delete');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (ArrowLeft)', () => {
                const { event, preventDefault } = createKeyDownEvent('ArrowLeft');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (Tab)', () => {
                const { event, preventDefault } = createKeyDownEvent('Tab');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('deve permitir ponto quando allowDecimal = true e sem ponto/vírgula ainda', () => {
                component.allowDecimal = true;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent('.', '');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir ponto quando allowDecimal = false', () => {
                component.allowDecimal = false;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent('.', '');
                component.onKeyDown(event);
                expect(preventDefault).toHaveBeenCalled();
            });

            it('deve permitir vírgula quando allowDecimal = true e sem ponto/vírgula ainda', () => {
                component.allowDecimal = true;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent(',', '');
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir segundo ponto quando já existe um', () => {
                component.allowDecimal = true;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent('.', '12.');
                component.onKeyDown(event);
                expect(preventDefault).toHaveBeenCalled();
            });

            it('deve permitir sinal negativo quando allowNegative = true e no início', () => {
                component.allowNegative = true;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent('-', '', 0);
                component.onKeyDown(event);
                expect(preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir negativo quando allowNegative = false', () => {
                component.allowNegative = false;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent('-', '');
                component.onKeyDown(event);
                expect(preventDefault).toHaveBeenCalled();
            });

            it('NÃO deve permitir negativo no meio do texto quando allowNegative = true', () => {
                component.allowNegative = true;
                fixture.detectChanges();
                const { event, preventDefault } = createKeyDownEvent('-', '12', 2);
                component.onKeyDown(event);
                expect(preventDefault).toHaveBeenCalled();
            });
        });

        describe('onInput', () => {
            it('deve limpar caracteres inválidos no onInput', () => {
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '12a34';
                const event = { target: input } as unknown as Event;
                component.onInput(event);
                expect(input.value).toBe('1234');
            });

            it('deve remover traços quando allowNegative = false', () => {
                component.allowNegative = false;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '12-34';
                const event = { target: input } as unknown as Event;
                component.onInput(event);
                expect(input.value).toBe('1234');
            });

            it('deve manter traço no início quando allowNegative = true', () => {
                component.allowNegative = true;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '-123';
                const event = { target: input } as unknown as Event;
                component.onInput(event);
                expect(input.value).toBe('-123');
            });

            it('deve remover traços internos quando allowNegative = true', () => {
                component.allowNegative = true;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '-12-34';
                const event = { target: input } as unknown as Event;
                component.onInput(event);
                expect(input.value).toBe('-1234');
            });

            it('deve remover pontos/vírgulas quando allowDecimal = false', () => {
                component.allowDecimal = false;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '12.34';
                const event = { target: input } as unknown as Event;
                component.onInput(event);
                expect(input.value).toBe('1234');
            });

            it('deve manter valor com ponto quando allowDecimal = true', () => {
                component.allowDecimal = true;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '12.34.56';
                const event = { target: input } as unknown as Event;
                component.onInput(event);
                expect(input.value).toBe('1234.56');
            });
        });

        describe('onPaste', () => {
            function createPasteEvent(text: string): ClipboardEvent {
                const clipboardData = {
                    getData: (type: string) => text
                } as DataTransfer;
                return {
                    clipboardData,
                    preventDefault: vi.fn()
                } as unknown as ClipboardEvent;
            }

            it('deve permitir paste de número quando allowDecimal = false e allowNegative = false', () => {
                component.allowDecimal = false;
                component.allowNegative = false;
                fixture.detectChanges();
                const event = createPasteEvent('12345');
                component.onPaste(event);
                expect(event.preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir paste com letras', () => {
                component.allowDecimal = false;
                component.allowNegative = false;
                fixture.detectChanges();
                const event = createPasteEvent('12a34');
                component.onPaste(event);
                expect(event.preventDefault).toHaveBeenCalled();
            });

            it('deve permitir paste com ponto quando allowDecimal = true', () => {
                component.allowDecimal = true;
                component.allowNegative = false;
                fixture.detectChanges();
                const event = createPasteEvent('12.34');
                component.onPaste(event);
                expect(event.preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir paste com ponto quando allowDecimal = false', () => {
                component.allowDecimal = false;
                component.allowNegative = false;
                fixture.detectChanges();
                const event = createPasteEvent('12.34');
                component.onPaste(event);
                expect(event.preventDefault).toHaveBeenCalled();
            });

            it('deve permitir paste com sinal negativo no início quando allowNegative = true', () => {
                component.allowDecimal = false;
                component.allowNegative = true;
                fixture.detectChanges();
                const event = createPasteEvent('-123');
                component.onPaste(event);
                expect(event.preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir paste com sinal negativo no meio quando allowNegative = true', () => {
                component.allowDecimal = false;
                component.allowNegative = true;
                fixture.detectChanges();
                const event = createPasteEvent('12-3');
                component.onPaste(event);
                expect(event.preventDefault).toHaveBeenCalled();
            });
        });
    });
});

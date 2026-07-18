import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SimpleInputComponent } from './SimpleInputComponent';

describe('SimpleInputComponent', () => {
    let component: SimpleInputComponent;
    let fixture: ComponentFixture<SimpleInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleInputComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleInputComponent);
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
                component.value = 'teste';
                fixture.detectChanges();
                expect(component.value).toBe('teste');
            });

            it('deve renderizar value no input', () => {
                component.value = 'abc';
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                expect(input.value).toBe('abc');
            });
        });

        describe('maxLength', () => {
            it('deve usar maxLength padrão undefined', () => {
                fixture.detectChanges();
                expect(component.maxLength).toBeUndefined();
            });

            it('deve aplicar maxLength fornecido', () => {
                component.maxLength = 10;
                fixture.detectChanges();
                expect(component.maxLength).toBe(10);
            });

            it('deve respeitar maxLength no onInput', () => {
                component.maxLength = 5;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.valueChange, 'emit');
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                input.value = '123456789';
                const event = { target: input } as Event;
                component.onInput(event);
                expect(input.value).toBe('12345');
                expect(emitSpy).toHaveBeenCalledWith('12345');
            });
        });

        describe('placeholder', () => {
            it('deve usar placeholder padrão vazio', () => {
                fixture.detectChanges();
                expect(component.placeholder).toBe('');
            });

            it('deve aplicar placeholder fornecido', () => {
                component.placeholder = 'Digite aqui';
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                expect(input.placeholder).toBe('Digite aqui');
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
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                expect(input.disabled).toBe(true);
            });
        });

        describe('allowOnlyAlphanumeric', () => {
            it('deve usar allowOnlyAlphanumeric = false como padrão', () => {
                fixture.detectChanges();
                expect(component.allowOnlyAlphanumeric).toBe(false);
            });
        });
    });

    describe('Outputs', () => {
        it('deve emitir valueChange com valor correto no onInput', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.valueChange, 'emit');
            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            input.value = 'novo valor';
            const event = { target: input } as Event;
            component.onInput(event);
            expect(emitSpy).toHaveBeenCalledWith('novo valor');
        });
    });

    describe('Métodos', () => {
        describe('onKeyDown', () => {
            it('deve permitir teclas de controle (Backspace)', () => {
                const event = new KeyboardEvent('keydown', { key: 'Backspace' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (Delete)', () => {
                const event = new KeyboardEvent('keydown', { key: 'Delete' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (ArrowLeft)', () => {
                const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('deve permitir teclas de controle (Tab)', () => {
                const event = new KeyboardEvent('keydown', { key: 'Tab' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('deve permitir quando ctrlKey pressionado', () => {
                const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('deve permitir quando metaKey pressionado', () => {
                const event = new KeyboardEvent('keydown', { key: 'a', metaKey: true });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('deve permitir alfanuméricos quando allowOnlyAlphanumeric = true', () => {
                component.allowOnlyAlphanumeric = true;
                fixture.detectChanges();
                const event = new KeyboardEvent('keydown', { key: 'a' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir não-alfanuméricos quando allowOnlyAlphanumeric = true', () => {
                component.allowOnlyAlphanumeric = true;
                fixture.detectChanges();
                const event = new KeyboardEvent('keydown', { key: '@' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).toHaveBeenCalled();
            });

            it('deve permitir qualquer tecla quando allowOnlyAlphanumeric = false', () => {
                component.allowOnlyAlphanumeric = false;
                fixture.detectChanges();
                const event = new KeyboardEvent('keydown', { key: '@' });
                const preventSpy = vi.spyOn(event, 'preventDefault');
                component.onKeyDown(event);
                expect(preventSpy).not.toHaveBeenCalled();
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

            it('deve permitir paste quando allowOnlyAlphanumeric = false', () => {
                component.allowOnlyAlphanumeric = false;
                fixture.detectChanges();
                const event = createPasteEvent('texto123');
                component.onPaste(event);
                expect(event.preventDefault).not.toHaveBeenCalled();
            });

            it('deve permitir paste alfanumérico quando allowOnlyAlphanumeric = true', () => {
                component.allowOnlyAlphanumeric = true;
                fixture.detectChanges();
                const event = createPasteEvent('abc123');
                component.onPaste(event);
                expect(event.preventDefault).not.toHaveBeenCalled();
            });

            it('NÃO deve permitir paste não-alfanumérico quando allowOnlyAlphanumeric = true', () => {
                component.allowOnlyAlphanumeric = true;
                fixture.detectChanges();
                const event = createPasteEvent('abc@123');
                component.onPaste(event);
                expect(event.preventDefault).toHaveBeenCalled();
            });
        });
    });
});

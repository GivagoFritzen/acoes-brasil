import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SimpleButtonComponent } from './SimpleButtonComponent';

describe('SimpleButtonComponent', () => {
    let component: SimpleButtonComponent;
    let fixture: ComponentFixture<SimpleButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleButtonComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleButtonComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('variant', () => {
            it('deve usar variant padrão "default" quando não fornecido', () => {
                fixture.detectChanges();
                expect(component.variant).toBe('default');
            });

            it('deve aplicar variant "cancelar" quando fornecido', () => {
                component.variant = 'cancelar';
                fixture.detectChanges();
                expect(component.variant).toBe('cancelar');
            });
        });

        describe('disabled', () => {
            it('deve usar disabled = false como padrão', () => {
                fixture.detectChanges();
                expect(component.disabled).toBe(false);
            });

            it('deve aplicar disabled = true quando fornecido', () => {
                component.disabled = true;
                fixture.detectChanges();
                expect(component.disabled).toBe(true);
            });
        });
    });

    describe('Outputs', () => {
        it('deve emitir btnClick quando handleClick() chamado e disabled = false', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.btnClick, 'emit');
            component.handleClick();
            expect(emitSpy).toHaveBeenCalled();
        });

        it('NÃO deve emitir btnClick quando handleClick() chamado e disabled = true', () => {
            component.disabled = true;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.btnClick, 'emit');
            component.handleClick();
            expect(emitSpy).not.toHaveBeenCalled();
        });
    });

    describe('Template', () => {
        it('deve aplicar classe CSS baseada no variant', () => {
            component.variant = 'cancelar';
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button'));
            expect(button.classes['btn--cancelar']).toBe(true);
        });

        it('deve desabilitar botão quando disabled = true', () => {
            component.disabled = true;
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            expect(button.disabled).toBe(true);
        });
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { HelpTipComponent } from './HelpTipComponent';

describe('HelpTipComponent', () => {
    let component: HelpTipComponent;
    let fixture: ComponentFixture<HelpTipComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HelpTipComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HelpTipComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('text', () => {
            it('deve usar text padrão vazio', () => {
                fixture.detectChanges();
                expect(component.text).toBe('');
            });

            it('deve aplicar text fornecido', () => {
                component.text = 'Ajuda aqui';
                fixture.detectChanges();
                expect(component.text).toBe('Ajuda aqui');
            });

            it('deve renderizar text no tip-content quando showTip = true', () => {
                component.text = 'Dica importante';
                component.showTip = true;
                fixture.detectChanges();
                const tipContent = fixture.debugElement.query(By.css('.tip-content'));
                expect(tipContent).toBeTruthy();
                expect(tipContent.nativeElement.textContent.trim()).toBe('Dica importante');
            });
        });
    });

    describe('Estado inicial', () => {
        it('deve começar com showTip = false', () => {
            fixture.detectChanges();
            expect(component.showTip).toBe(false);
        });

        it('NÃO deve mostrar tip-content com active no início', () => {
            fixture.detectChanges();
            const tipContent = fixture.debugElement.query(By.css('.tip-content'));
            expect(tipContent.classes['active']).toBeFalsy();
        });
    });

    describe('Métodos', () => {
        describe('toggleTip', () => {
            it('deve alternar showTip para true quando false', () => {
                component.showTip = false;
                fixture.detectChanges();
                const event = { stopPropagation: vi.fn() } as Event;
                component.toggleTip(event);
                expect(component.showTip).toBe(true);
            });

            it('deve alternar showTip para false quando true', () => {
                component.showTip = true;
                fixture.detectChanges();
                const event = { stopPropagation: vi.fn() } as Event;
                component.toggleTip(event);
                expect(component.showTip).toBe(false);
            });

            it('deve parar propagação do evento no toggleTip()', () => {
                fixture.detectChanges();
                const stopPropagationSpy = vi.fn();
                const event = { stopPropagation: stopPropagationSpy } as Event;
                component.toggleTip(event);
                expect(stopPropagationSpy).toHaveBeenCalled();
            });
        });

        describe('closeTip (HostListener)', () => {
            it('deve fechar tip (showTip = false) quando document clicado', () => {
                component.showTip = true;
                fixture.detectChanges();
                expect(component.showTip).toBe(true);

                document.dispatchEvent(new Event('click'));
                fixture.detectChanges();

                expect(component.showTip).toBe(false);
            });

            it('NÃO deve afetar showTip = false quando document clicado e já estava false', () => {
                component.showTip = false;
                fixture.detectChanges();

                document.dispatchEvent(new Event('click'));
                fixture.detectChanges();

                expect(component.showTip).toBe(false);
            });
        });
    });

    describe('Template', () => {
        it('deve mostrar botão help-tip sempre', () => {
            fixture.detectChanges();
            const helpTip = fixture.debugElement.query(By.css('.help-tip'));
            expect(helpTip).toBeTruthy();
        });

        it('deve adicionar classe active no tip-content quando showTip = true', () => {
            component.showTip = true;
            fixture.detectChanges();
            const tipContent = fixture.debugElement.query(By.css('.tip-content'));
            expect(tipContent.classes['active']).toBe(true);
        });

        it('deve remover classe active no tip-content quando showTip = false', () => {
            component.showTip = false;
            fixture.detectChanges();
            const tipContent = fixture.debugElement.query(By.css('.tip-content'));
            expect(tipContent.classes['active']).toBeFalsy();
        });

        it('deve alternar active ao clicar no botão help-tip', () => {
            fixture.detectChanges();
            
            // Initially not active
            let tipContent = fixture.debugElement.query(By.css('.tip-content'));
            expect(tipContent.classes['active']).toBeFalsy();

            // Click to show
            const button = fixture.debugElement.query(By.css('.help-tip'));
            button.triggerEventHandler('click', { stopPropagation: vi.fn() });
            fixture.detectChanges();

            tipContent = fixture.debugElement.query(By.css('.tip-content'));
            expect(tipContent.classes['active']).toBe(true);

            // Click to hide
            button.triggerEventHandler('click', { stopPropagation: vi.fn() });
            fixture.detectChanges();

            tipContent = fixture.debugElement.query(By.css('.tip-content'));
            expect(tipContent.classes['active']).toBeFalsy();
        });
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { ActionButtonComponent } from './action-button.component';

describe('ActionButtonComponent', () => {
    let component: ActionButtonComponent;
    let fixture: ComponentFixture<ActionButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ActionButtonComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ActionButtonComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('title', () => {
            it('deve usar title padrão "Ação" quando não fornecido', () => {
                fixture.detectChanges();
                expect(component.title).toBe('Ação');
            });

            it('deve aplicar title fornecido', () => {
                component.title = 'Salvar';
                fixture.detectChanges();
                expect(component.title).toBe('Salvar');
            });

            it('deve aplicar title como atributo no botão', () => {
                component.title = 'Excluir';
                fixture.detectChanges();
                const button = fixture.debugElement.query(By.css('button')).nativeElement;
                expect(button.getAttribute('title')).toBe('Excluir');
            });
        });
    });

    describe('Outputs', () => {
        it('deve emitir actionClick quando handleClick() chamado', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.actionClick, 'emit');
            component.handleClick();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('Métodos', () => {
        it('deve emitir actionClick via clique no botão', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.actionClick, 'emit');
            const button = fixture.debugElement.query(By.css('button'));
            button.triggerEventHandler('click');
            expect(emitSpy).toHaveBeenCalled();
        });
    });
});

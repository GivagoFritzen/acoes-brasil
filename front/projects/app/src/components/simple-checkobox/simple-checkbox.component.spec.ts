import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SimpleCheckboxComponent } from './simple-checkbox.component';

describe('SimpleCheckboxComponent', () => {
    let component: SimpleCheckboxComponent;
    let fixture: ComponentFixture<SimpleCheckboxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleCheckboxComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleCheckboxComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('checked', () => {
            it('deve usar checked = false como padrão', () => {
                fixture.detectChanges();
                expect(component.checked).toBe(false);
            });

            it('deve aplicar checked = true quando fornecido', () => {
                component.checked = true;
                fixture.detectChanges();
                expect(component.checked).toBe(true);
            });

            it('deve refletir checked no input element', () => {
                component.checked = true;
                fixture.detectChanges();
                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                expect(input.checked).toBe(true);
            });
        });
    });

    describe('Outputs', () => {
        it('deve emitir checkedChange com true quando onChange() chamado com checked = true', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.checkedChange, 'emit');
            const event = { target: { checked: true } } as unknown as Event;
            component.onChange(event);
            expect(emitSpy).toHaveBeenCalledWith(true);
        });

        it('deve emitir checkedChange com false quando onChange() chamado com checked = false', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.checkedChange, 'emit');
            const event = { target: { checked: false } } as unknown as Event;
            component.onChange(event);
            expect(emitSpy).toHaveBeenCalledWith(false);
        });

        it('deve emitir checkedChange via evento change do input', () => {
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.checkedChange, 'emit');
            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            input.checked = true;
            input.dispatchEvent(new Event('change'));
            expect(emitSpy).toHaveBeenCalledWith(true);
        });
    });
});

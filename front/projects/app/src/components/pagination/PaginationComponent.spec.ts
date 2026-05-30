import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { PaginationComponent } from './PaginationComponent';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('page', () => {
            it('deve usar page padrão 1', () => {
                fixture.detectChanges();
                expect(component.page).toBe(1);
            });

            it('deve aplicar page fornecido', () => {
                component.page = 3;
                fixture.detectChanges();
                expect(component.page).toBe(3);
            });
        });

        describe('totalPages', () => {
            it('deve usar totalPages padrão 1', () => {
                fixture.detectChanges();
                expect(component.totalPages).toBe(1);
            });

            it('deve aplicar totalPages fornecido', () => {
                component.totalPages = 5;
                fixture.detectChanges();
                expect(component.totalPages).toBe(5);
            });
        });

        describe('align', () => {
            it('deve usar align padrão right', () => {
                fixture.detectChanges();
                expect(component.align).toBe('right');
            });

            it('deve aplicar align left', () => {
                component.align = 'left';
                fixture.detectChanges();
                expect(component.align).toBe('left');
            });

            it('deve aplicar align center', () => {
                component.align = 'center';
                fixture.detectChanges();
                expect(component.align).toBe('center');
            });

            it('deve renderizar classe pagination--left quando align left', () => {
                component.align = 'left';
                fixture.detectChanges();
                const nav = fixture.debugElement.query(By.css('nav')).nativeElement;
                expect(nav.classList.contains('pagination--left')).toBe(true);
                expect(nav.classList.contains('pagination--right')).toBe(false);
            });

            it('deve renderizar classe pagination--center quando align center', () => {
                component.align = 'center';
                fixture.detectChanges();
                const nav = fixture.debugElement.query(By.css('nav')).nativeElement;
                expect(nav.classList.contains('pagination--center')).toBe(true);
            });

            it('deve renderizar classe pagination--right quando align right', () => {
                component.align = 'right';
                fixture.detectChanges();
                const nav = fixture.debugElement.query(By.css('nav')).nativeElement;
                expect(nav.classList.contains('pagination--right')).toBe(true);
            });
        });
    });

    describe('Renderização', () => {
        it('deve exibir informação de página correta', () => {
            component.page = 2;
            component.totalPages = 5;
            fixture.detectChanges();
            const info = fixture.debugElement.query(By.css('.pagination__info')).nativeElement;
            expect(info.textContent.trim()).toBe('Página 2 de 5');
        });

        it('deve desabilitar botão anterior quando page <= 1', () => {
            component.page = 1;
            component.totalPages = 5;
            fixture.detectChanges();
            const btnPrevious = fixture.debugElement.query(By.css('.pagination__previous')).nativeElement;
            expect(btnPrevious.disabled).toBe(true);
        });

        it('deve habilitar botão anterior quando page > 1', () => {
            component.page = 2;
            component.totalPages = 5;
            fixture.detectChanges();
            const btnPrevious = fixture.debugElement.query(By.css('.pagination__previous')).nativeElement;
            expect(btnPrevious.disabled).toBe(false);
        });

        it('deve desabilitar botão próximo quando page >= totalPages', () => {
            component.page = 5;
            component.totalPages = 5;
            fixture.detectChanges();
            const btnNext = fixture.debugElement.query(By.css('.pagination__next')).nativeElement;
            expect(btnNext.disabled).toBe(true);
        });

        it('deve habilitar botão próximo quando page < totalPages', () => {
            component.page = 3;
            component.totalPages = 5;
            fixture.detectChanges();
            const btnNext = fixture.debugElement.query(By.css('.pagination__next')).nativeElement;
            expect(btnNext.disabled).toBe(false);
        });
    });

    describe('Outputs', () => {
        describe('previous', () => {
            it('deve emitir previous quando emitPrevious() e page > 1', () => {
                component.page = 3;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.previous, 'emit');
                component.emitPrevious();
                expect(emitSpy).toHaveBeenCalled();
            });

            it('NÃO deve emitir previous quando emitPrevious() e page = 1', () => {
                component.page = 1;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.previous, 'emit');
                component.emitPrevious();
                expect(emitSpy).not.toHaveBeenCalled();
            });

            it('deve emitir previous ao clicar no botão anterior', () => {
                component.page = 2;
                component.totalPages = 5;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.previous, 'emit');
                const btnPrevious = fixture.debugElement.query(By.css('.pagination__previous')).nativeElement;
                btnPrevious.click();
                expect(emitSpy).toHaveBeenCalled();
            });
        });

        describe('next', () => {
            it('deve emitir next quando emitNext() e page < totalPages', () => {
                component.page = 2;
                component.totalPages = 5;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.next, 'emit');
                component.emitNext();
                expect(emitSpy).toHaveBeenCalled();
            });

            it('NÃO deve emitir next quando emitNext() e page = totalPages', () => {
                component.page = 5;
                component.totalPages = 5;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.next, 'emit');
                component.emitNext();
                expect(emitSpy).not.toHaveBeenCalled();
            });

            it('deve emitir next ao clicar no botão próximo', () => {
                component.page = 2;
                component.totalPages = 5;
                fixture.detectChanges();
                const emitSpy = vi.spyOn(component.next, 'emit');
                const btnNext = fixture.debugElement.query(By.css('.pagination__next')).nativeElement;
                btnNext.click();
                expect(emitSpy).toHaveBeenCalled();
            });
        });
    });

    describe('Métodos', () => {
        it('deve chamar emitPrevious quando page > 1', () => {
            component.page = 3;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.previous, 'emit');
            component.emitPrevious();
            expect(emitSpy).toHaveBeenCalledTimes(1);
        });

        it('NÃO deve chamar emitPrevious quando page <= 1', () => {
            component.page = 1;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.previous, 'emit');
            component.emitPrevious();
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('deve chamar emitNext quando page < totalPages', () => {
            component.page = 2;
            component.totalPages = 5;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.next, 'emit');
            component.emitNext();
            expect(emitSpy).toHaveBeenCalledTimes(1);
        });

        it('NÃO deve chamar emitNext quando page >= totalPages', () => {
            component.page = 5;
            component.totalPages = 5;
            fixture.detectChanges();
            const emitSpy = vi.spyOn(component.next, 'emit');
            component.emitNext();
            expect(emitSpy).not.toHaveBeenCalled();
        });
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, NgZone } from '@angular/core';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { MarketHoursService } from '../../services/market-hours.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ChangeDetectionService } from '../../services/change-detection.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-language-selector',
    standalone: true,
    template: '<div class="language-selector-mock"></div>'
})
class MockLanguageSelectorComponent {}

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let mockMarketHoursService: any;
    let ngZone: NgZone;

    const createMarketHoursResponse = (isOpen: boolean) => ({
        success: true,
        data: {
            isOpen,
            id: 'test',
            name: 'BVMF',
            shortName: 'B3',
            country: 'BR',
            region: 'BR',
            timezone: 'America/Sao_Paulo',
            currency: 'BRL',
            marketCap: '1T',
            location: 'Sao Paulo',
            website: 'https://b3.com.br',
            openTime: '10:00',
            closeTime: '18:00',
            holidays: [],
            tradingDays: [1, 2, 3, 4, 5],
            nextOpenTime: '',
            currentStatus: 'open' as any,
            upcomingHolidays: []
        }
    });

    beforeEach(async () => {
        mockMarketHoursService = {
            getBvmfMarketHours: vi.fn().mockReturnValue(of(createMarketHoursResponse(false)))
        };

        const mockTranslationService = {
            get: vi.fn().mockReturnValue('Test'),
            currentLang$: of('pt-BR'),
            loadLanguage: vi.fn().mockResolvedValue(undefined),
            has: vi.fn().mockReturnValue(true),
            getCurrentLanguage: vi.fn().mockReturnValue('pt-BR')
        };

        const mockChangeDetectionService = {
            changeDetection: of(void 0)
        };

        await TestBed.configureTestingModule({
            imports: [
                SidebarComponent,
                TranslatePipe,
                MockLanguageSelectorComponent,
                ClickOutsideDirective,
                RouterModule.forRoot([])
            ],
            providers: [
                { provide: MarketHoursService, useValue: mockMarketHoursService },
                { provide: TranslationService, useValue: mockTranslationService },
                { provide: ChangeDetectionService, useValue: mockChangeDetectionService },
                { provide: DOCUMENT, useValue: document }
            ]
        }).compileComponents();

        ngZone = TestBed.inject(NgZone);
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
    });

    const flushMicrotasks = async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    const runInZone = (fn: () => void) => {
        ngZone.run(() => fn());
    };

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Estado inicial', () => {
        it('deve usar showSidebar = true como padrão', () => {
            fixture.detectChanges();
            expect(component.showSidebar).toBe(true);
        });

        it('deve usar isMarketOpen = false como padrão', async () => {
            component.ngOnInit();
            await flushMicrotasks();
            fixture.detectChanges();
            expect(component.isMarketOpen).toBe(false);
        });

        it('deve renderizar sidebar expandido por padrão', () => {
            fixture.detectChanges();
            const sidebar = fixture.debugElement.query(By.css('.sidebar')).nativeElement;
            expect(sidebar.classList.contains('sidebar--collapsed')).toBe(false);
        });
    });

    describe('ngOnInit', () => {
        it('deve chamar fetchMarketStatus() no ngOnInit', () => {
            mockMarketHoursService.getBvmfMarketHours.mockClear();
            component.ngOnInit();
            expect(mockMarketHoursService.getBvmfMarketHours).toHaveBeenCalled();
        });

        it('deve definir isMarketOpen = false quando API retorna isOpen = false', async () => {
            component.ngOnInit();
            await flushMicrotasks();
            expect(component.isMarketOpen).toBe(false);
        });

        it('deve definir isMarketOpen = false quando API retorna erro', async () => {
            mockMarketHoursService.getBvmfMarketHours.mockReturnValue(throwError(() => new Error('API Error')));
            component.ngOnInit();
            await flushMicrotasks();
            expect(component.isMarketOpen).toBe(false);
        });
    });

    describe('toggleSidebar', () => {
        it('deve alternar showSidebar para false quando true', () => {
            component.showSidebar = true;
            component.toggleSidebar();
            expect(component.showSidebar).toBe(false);
        });

        it('deve alternar showSidebar para true quando false', () => {
            component.showSidebar = false;
            component.toggleSidebar();
            expect(component.showSidebar).toBe(true);
        });

        it('deve alternarshowSidebar ao togglar', async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.showSidebar).toBe(true);
            component.toggleSidebar();
            expect(component.showSidebar).toBe(false);
            component.toggleSidebar();
            expect(component.showSidebar).toBe(true);
        });
    });

    describe('Renderização', () => {
        it('deve renderizar menu de navegação', () => {
            fixture.detectChanges();
            const menu = fixture.debugElement.query(By.css('.sidebar__menu'));
            expect(menu).toBeTruthy();
        });

        it('deve renderizar 5 itens de menu', () => {
            fixture.detectChanges();
            const menuItems = fixture.debugElement.queryAll(By.css('.menu-item'));
            expect(menuItems.length).toBe(5);
        });

        it('deve renderizar language selector', () => {
            fixture.detectChanges();
            const langSelector = fixture.debugElement.query(By.css('app-language-selector'));
            expect(langSelector).toBeTruthy();
        });

        it('deve renderizar status do mercado', () => {
            fixture.detectChanges();
            const status = fixture.debugElement.query(By.css('.sidebar__status'));
            expect(status).toBeTruthy();
        });

        it('deve renderizar dot para status', () => {
            fixture.detectChanges();
            const dot = fixture.debugElement.query(By.css('.dot'));
            expect(dot).toBeTruthy();
        });

        it('deve usar classe dot--closed quando isMarketOpen = false', async () => {
            component.ngOnInit();
            await flushMicrotasks();
            fixture.detectChanges();
            const dot = fixture.debugElement.query(By.css('.dot')).nativeElement;
            expect(dot.classList.contains('dot--closed')).toBe(true);
            expect(dot.classList.contains('dot--open')).toBe(false);
        });

        it('deve ocultar labels quando showSidebar = false', () => {
            component.showSidebar = false;
            fixture.detectChanges();
            const sidebar = fixture.debugElement.query(By.css('.sidebar')).nativeElement;
            expect(sidebar.classList.contains('sidebar--collapsed')).toBe(true);
        });

        it('deve mostrar labels quando showSidebar = true', () => {
            component.showSidebar = true;
            fixture.detectChanges();
            const sidebar = fixture.debugElement.query(By.css('.sidebar')).nativeElement;
            expect(sidebar.classList.contains('sidebar--collapsed')).toBe(false);
        });

        it('deve renderizar toggle button', () => {
            fixture.detectChanges();
            const toggleBtn = fixture.debugElement.query(By.css('.sidebar__toggle'));
            expect(toggleBtn).toBeTruthy();
        });

        it('deve mostrar language selector quando showSidebar = true', () => {
            component.showSidebar = true;
            fixture.detectChanges();
            const langSection = fixture.debugElement.query(By.css('.sidebar__language'));
            expect(langSection).toBeTruthy();
        });

        it('deve ocultar language selector quando showSidebar = false', () => {
            component.showSidebar = false;
            fixture.detectChanges();
            const langSection = fixture.debugElement.query(By.css('.sidebar__language'));
            expect(langSection).toBeFalsy();
        });
    });

    describe('Interações', () => {
        it('deve togglar sidebar ao clicar no botão toggle', () => {
            fixture.detectChanges();
            expect(component.showSidebar).toBe(true);
            const toggleBtn = fixture.debugElement.query(By.css('.sidebar__toggle')).nativeElement;
            toggleBtn.click();
            fixture.detectChanges();
            expect(component.showSidebar).toBe(false);
        });

        it('deve verificar mudança de estado showSidebar', async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.showSidebar).toBe(true);

            component.toggleSidebar();
            expect(component.showSidebar).toBe(false);
        });
    });

    describe('Market Hours Service', () => {
        it('deve injetar MarketHoursService no construtor', () => {
            expect(mockMarketHoursService).toBeTruthy();
        });

        it('deve chamar getBvmfMarketHours apenas uma vez', () => {
            mockMarketHoursService.getBvmfMarketHours.mockClear();
            component.ngOnInit();
            expect(mockMarketHoursService.getBvmfMarketHours).toHaveBeenCalledTimes(1);
        });
    });
});
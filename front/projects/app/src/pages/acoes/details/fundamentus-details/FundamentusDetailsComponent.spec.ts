import { TestBed } from '@angular/core/testing';
import type { FundamentusAcaoDetails, FundamentusIndicator } from '../../../../models';
import { TranslationService } from '../../../../services/TranslationService';
import { FundamentusDetailsComponent } from './FundamentusDetailsComponent';

describe('FundamentusDetailsComponent', () => {
    let component: FundamentusDetailsComponent;
    let translationServiceMock: {
        get: ReturnType<typeof vi.fn>;
        has: ReturnType<typeof vi.fn>;
    };

    const baseIndicator: FundamentusIndicator = {
        label: 'P/L',
        value: '10.5',
    };

    const baseFundamentus: FundamentusAcaoDetails = {
        codigo: 'PETR4',
        empresa: 'Petrobras',
        setor: 'Petroleo',
        subsetor: 'Exploracao',
        indicadores: [baseIndicator],
        updatedAt: '2024-01-01',
    };

    beforeEach(async () => {
        translationServiceMock = {
            get: vi.fn((key: string) => key),
            has: vi.fn((key: string) => false),
        };

        await TestBed.configureTestingModule({
            imports: [FundamentusDetailsComponent],
            providers: [
                { provide: TranslationService, useValue: translationServiceMock },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(FundamentusDetailsComponent);
        component = fixture.componentInstance;
    });

    it('deve criar componente', () => {
        expect(component).toBeTruthy();
    });

    it('deve ter fundamentus null por padrao', () => {
        expect(component.fundamentus).toBeNull();
    });

    it('deve aceitar fundamentus via input', () => {
        component.fundamentus = baseFundamentus;

        expect(component.fundamentus?.codigo).toBe('PETR4');
    });

    describe('hasHelp', () => {
        it('deve retornar true quando translationService.has retorna true', () => {
            translationServiceMock.has.mockReturnValue(true);

            expect(component.hasHelp('P/L')).toBe(true);
        });

        it('deve retornar false quando translationService.has retorna false', () => {
            translationServiceMock.has.mockReturnValue(false);

            const result = component.hasHelp('P/L');

            expect(result).toBe(false);
            expect(translationServiceMock.has).toHaveBeenCalledWith('indicators.PL');
        });
    });

    describe('getHelp', () => {
        it('deve retornar help text do translationService.get', () => {
            translationServiceMock.has.mockReturnValue(true);
            translationServiceMock.get.mockReturnValue('Help text');

            const result = component.getHelp('P/L');

            expect(result).toBe('Help text');
            expect(translationServiceMock.get).toHaveBeenCalledWith('indicators.PL');
        });
    });
});

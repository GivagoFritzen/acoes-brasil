import { TestBed } from '@angular/core/testing';
import type { YahooFinanceDetails } from '../../../../models';
import { TranslationService } from '../../../../services/TranslationService';
import { YahooFinanceDetailsComponent } from './YahooFinanceDetailsComponent';

describe('YahooFinanceDetailsComponent', () => {
    let component: YahooFinanceDetailsComponent;
    let translationServiceMock: {
        get: ReturnType<typeof vi.fn>;
        has: ReturnType<typeof vi.fn>;
    };

    const baseYahooFinance: YahooFinanceDetails = {
        codigo: 'VALE3',
        empresa: null,
        keyStatistics: {
            enterpriseValue: '404.72B',
            forwardPE: '46.57',
            profitMargins: '7.26%',
            floatShares: null,
            sharesOutstanding: null,
            heldPercentInsiders: '6.45%',
            heldPercentInstitutions: '54.47%',
            beta: '0.73',
            bookValue: '44.84',
            priceToBook: '1.66',
            earningsQuarterlyGrowth: null,
            netIncomeToCommon: null,
            trailingEps: '3.42',
            forwardEps: '8.18',
            pegRatio: '0.30',
            enterpriseToRevenue: null,
            enterpriseToEbitda: null,
            lastDividendValue: null,
            lastDividendDate: null,
            lastSplitFactor: null,
            marketCap: null,
        },
        financialData: {
            currentPrice: '74.51',
            targetHighPrice: null,
            targetLowPrice: null,
            targetMeanPrice: '87.27',
            targetMedianPrice: null,
            recommendationMean: null,
            recommendationKey: 'buy',
            numberOfAnalystOpinions: null,
            totalCash: '27.55B',
            totalCashPerShare: null,
            ebitda: null,
            totalDebt: '111.96B',
            quickRatio: null,
            currentRatio: null,
            totalRevenue: null,
            debtToEquity: '57.15%',
            revenuePerShare: null,
            returnOnAssets: null,
            returnOnEquity: '6.84%',
            grossProfits: null,
            freeCashflow: '10.6B',
            operatingCashflow: '48.82B',
            earningsGrowth: null,
            revenueGrowth: '2.70%',
            grossMargins: '35.08%',
            ebitdaMargins: '36.25%',
            operatingMargins: null,
            profitMargins: '7.26%',
        },
        incomeStatements: [],
        balanceSheets: [],
        cashflowStatements: [],
        earningsHistory: [],
        calendarEvents: null,
        updatedAt: '2024-01-01',
    };

    beforeEach(async () => {
        translationServiceMock = {
            get: vi.fn((key: string) => key),
            has: vi.fn((key: string) => false),
        };

        await TestBed.configureTestingModule({
            imports: [YahooFinanceDetailsComponent],
            providers: [
                { provide: TranslationService, useValue: translationServiceMock },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(YahooFinanceDetailsComponent);
        component = fixture.componentInstance;
    });

    it('deve criar componente', () => {
        expect(component).toBeTruthy();
    });

    it('deve ter yahooFinance null por padrao', () => {
        expect(component.yahooFinanceValue()).toBeNull();
    });

    it('deve aceitar yahooFinance via input', () => {
        const fixture = TestBed.createComponent(YahooFinanceDetailsComponent);
        fixture.componentRef.setInput('yahooFinance', baseYahooFinance);
        const comp = fixture.componentInstance;

        expect(comp.yahooFinanceValue()?.codigo).toBe('VALE3');
    });

    describe('getFieldValue', () => {
        it('deve retornar valor quando chave existe', () => {
            const item = { testKey: 'testValue' };

            const result = component.getFieldValue(item, 'testKey');

            expect(result).toBe('testValue');
        });

        it('deve retornar null quando chave nao existe', () => {
            const item = { testKey: 'testValue' };

            const result = component.getFieldValue(item, 'inexistente');

            expect(result).toBeNull();
        });

        it('deve retornar null quando item e null', () => {
            const result = component.getFieldValue(null as unknown as object, 'testKey');

            expect(result).toBeNull();
        });
    });

    describe('incomeStatementFields', () => {
        it('deve ter 9 campos', () => {
            expect(component.incomeStatementFields.length).toBe(9);
        });

        it('deve incluir Receita', () => {
            expect(component.incomeStatementFields[0].label).toBe('Receita');
        });
    });

    describe('balanceSheetFields', () => {
        it('deve ter 8 campos', () => {
            expect(component.balanceSheetFields.length).toBe(8);
        });

        it('deve incluir Ativo Total', () => {
            expect(component.balanceSheetFields[0].label).toBe('Ativo Total');
        });
    });

    describe('cashflowFields', () => {
        it('deve ter 7 campos', () => {
            expect(component.cashflowFields.length).toBe(7);
        });

        it('deve incluir FCO', () => {
            expect(component.cashflowFields[2].label).toBe('FCO');
        });
    });

    describe('hasHelp / getHelp', () => {
        it('deve retornar true quando translationService.has retorna true', () => {
            translationServiceMock.has.mockReturnValue(true);

            expect(component.hasHelp('P/L')).toBe(true);
        });

        it('deve retornar help text do translationService.get', () => {
            translationServiceMock.has.mockReturnValue(true);
            translationServiceMock.get.mockReturnValue('Help text');

            const result = component.getHelp('P/L');

            expect(result).toBe('Help text');
        });
    });
});

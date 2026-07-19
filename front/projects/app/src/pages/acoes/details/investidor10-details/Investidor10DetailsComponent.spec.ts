import { TestBed } from '@angular/core/testing';
import type { Investidor10AcaoDetails, Investidor10FiiDetails } from '../../../../models';
import { TranslationService } from '../../../../services/TranslationService';
import { Investidor10DetailsComponent } from './Investidor10DetailsComponent';

describe('Investidor10DetailsComponent', () => {
    let component: Investidor10DetailsComponent;
    let translationServiceMock: {
        get: ReturnType<typeof vi.fn>;
        has: ReturnType<typeof vi.fn>;
    };

    const baseAcao: Investidor10AcaoDetails = {
        codigo: 'VIVT3',
        empresa: 'VIVO - TELEFÔNICA BRASIL',
        dadosSobreEmpresa: [],
        informacoesSobreEmpresa: [],
        indicadoresFundamentalistas: [],
        historicoIndicadores: [],
        indicadoresFundamentalistasComHistorico: [],
        receitas: [],
        updatedAt: '2024-01-01',
    };

    const baseFii: Investidor10FiiDetails = {
        codigo: 'KNRI11',
        empresa: 'Kinea Renda Imobiliaria',
        dadosSobreEmpresa: [],
        informacoesSobreEmpresa: [],
        indicadoresFundamentalistas: [],
        historicoIndicadores: [],
        imoveis: [],
        informacoesFii: [],
        indicadoresFundamentalistasFii: [],
        updatedAt: '2024-01-01',
    };

    beforeEach(async () => {
        translationServiceMock = {
            get: vi.fn((key: string) => key),
            has: vi.fn((key: string) => false),
        };

        await TestBed.configureTestingModule({
            imports: [Investidor10DetailsComponent],
            providers: [
                { provide: TranslationService, useValue: translationServiceMock },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(Investidor10DetailsComponent);
        component = fixture.componentInstance;
    });

    it('deve criar componente', () => {
        expect(component).toBeTruthy();
    });

    describe('isFii', () => {
        it('deve retornar false quando investidor10 e null', () => {
            expect(component.isFii()).toBe(false);
        });

        it('deve retornar false quando for acao', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseAcao);
            const comp = fixture.componentInstance;

            expect(comp.isFii()).toBe(false);
        });

        it('deve retornar true quando for FII', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseFii);
            const comp = fixture.componentInstance;

            expect(comp.isFii()).toBe(true);
        });
    });

    describe('imoveis', () => {
        it('deve retornar array vazio quando for acao', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseAcao);
            const comp = fixture.componentInstance;

            expect(comp.imoveis()).toEqual([]);
        });

        it('deve retornar imoveis quando for FII', () => {
            const fiiComImoveis: Investidor10FiiDetails = {
                ...baseFii,
                imoveis: [{ nome: 'Edificio Centro', estado: 'SP', areaBrutaLocavel: '5000 m²' }],
            };
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', fiiComImoveis);
            const comp = fixture.componentInstance;

            expect(comp.imoveis().length).toBe(1);
            expect(comp.imoveis()[0].nome).toBe('Edificio Centro');
        });
    });

    describe('informacoesFii', () => {
        it('deve retornar array vazio quando for acao', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseAcao);
            const comp = fixture.componentInstance;

            expect(comp.informacoesFii()).toEqual([]);
        });

        it('deve retornar informacoesFii quando for FII', () => {
            const fiiComInfo: Investidor10FiiDetails = {
                ...baseFii,
                informacoesFii: [{ label: 'Segmento', value: 'Lajes Corporativas' }],
            };
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', fiiComInfo);
            const comp = fixture.componentInstance;

            expect(comp.informacoesFii().length).toBe(1);
            expect(comp.informacoesFii()[0].label).toBe('Segmento');
        });
    });

    describe('acaoDetails', () => {
        it('deve retornar null quando for FII', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseFii);
            const comp = fixture.componentInstance;

            expect(comp.acaoDetails()).toBeNull();
        });

        it('deve retornar acao quando for acao', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseAcao);
            const comp = fixture.componentInstance;

            expect(comp.acaoDetails()?.codigo).toBe('VIVT3');
        });
    });

    describe('getValorHistorico', () => {
        it('deve retornar hifen quando valor nao encontrado', () => {
            const indicador: Parameters<typeof component.getValorHistorico>[0] = {
                indicador: 'P/L',
                valores: [],
            };

            const result = component.getValorHistorico(indicador, 2024);

            expect(result).toBe('-');
        });

        it('deve retornar valor formatado quando encontrado', () => {
            const indicador: Parameters<typeof component.getValorHistorico>[0] = {
                indicador: 'P/L',
                valores: [{ ano: 2024, valor: 15.5, tipo: 'numeric' }],
            };

            const result = component.getValorHistorico(indicador, 2024);

            expect(result).toBe('15,50');
        });

        it('deve retornar valor percentual com sufixo', () => {
            const indicador: Parameters<typeof component.getValorHistorico>[0] = {
                indicador: 'Margem',
                valores: [{ ano: 2024, valor: 25.3, tipo: 'percent' }],
            };

            const result = component.getValorHistorico(indicador, 2024);

            expect(result).toBe('25,30%');
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

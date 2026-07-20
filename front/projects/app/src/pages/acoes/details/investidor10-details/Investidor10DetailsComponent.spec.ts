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

    describe('receitaAtual', () => {
        it('deve retornar null quando acao nao tem receitas', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseAcao);
            const comp = fixture.componentInstance;

            expect(comp.receitaAtual()).toBeNull();
        });

        it('deve retornar primeira receita quando acao possui receitas', () => {
            const acaoComReceitas: Investidor10AcaoDetails = {
                ...baseAcao,
                receitas: [
                    {
                        ano: 2023,
                        receitaTotal: '100',
                        regioes: [{ nome: 'Sudeste', porcentagem: 60 }],
                        negocios: [{ nome: 'Varejo', porcentagem: 40 }],
                    },
                ],
            };
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', acaoComReceitas);
            const comp = fixture.componentInstance;

            expect(comp.receitaAtual()?.ano).toBe(2023);
        });

        it('deve renderizar sem erro quando acao nao tem receitas', () => {
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', baseAcao);

            expect(() => fixture.detectChanges()).not.toThrow();
        });
    });

    describe('historico mobile', () => {
        it('deve renderizar data-periodo nos valores quando acao tem historico', () => {
            const acaoComHistorico: Investidor10AcaoDetails = {
                ...baseAcao,
                indicadoresFundamentalistasComHistorico: [
                    {
                        nome: 'P/L',
                        valores: [
                            { periodo: '2024', valor: '15,50' },
                            { periodo: '2023', valor: '14,20' },
                        ],
                        tipo: 'numerico',
                    },
                ],
            };
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', acaoComHistorico);
            fixture.detectChanges();

            const valores = fixture.nativeElement.querySelectorAll('.acao-details__historico-table-inner .col-valor');
            expect(valores.length).toBe(2);
            expect(valores[0].getAttribute('data-periodo')).toBe('2024');
            expect(valores[1].getAttribute('data-periodo')).toBe('2023');
        });

        it('deve renderizar data-periodo nos valores quando FII tem historico', () => {
            const fiiComHistorico: Investidor10FiiDetails = {
                ...baseFii,
                indicadoresFundamentalistasFii: [
                    {
                        nome: 'Dividend Yield',
                        valores: [
                            { periodo: '3T24', valor: '8,10%' },
                            { periodo: '2T24', valor: '7,90%' },
                        ],
                        tipo: 'percentual',
                    },
                ],
            };
            const fixture = TestBed.createComponent(Investidor10DetailsComponent);
            fixture.componentRef.setInput('investidor10', fiiComHistorico);
            fixture.detectChanges();

            const valores = fixture.nativeElement.querySelectorAll('.acao-details__historico-table-inner .col-valor');
            expect(valores.length).toBe(2);
            expect(valores[0].getAttribute('data-periodo')).toBe('3T24');
            expect(valores[1].getAttribute('data-periodo')).toBe('2T24');
        });
    });
});

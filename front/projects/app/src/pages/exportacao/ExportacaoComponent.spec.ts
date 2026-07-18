import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SellSnapshotExportRow } from '../../models/SellSnapshotExportRowModel';
import { OrdersService } from '../../services/OrdersService';
import { ExportacaoComponent } from './ExportacaoComponent';

describe('ExportacaoComponent', () => {
  let component: ExportacaoComponent;
  let ordersServiceMock: {
    exportSellSnapshotsSpreadsheet: ReturnType<typeof vi.fn>;
    getSellSnapshotsForPdf: ReturnType<typeof vi.fn>;
  };

  const baseRows: SellSnapshotExportRow[] = [
    {
      codigo: 'PETR4',
      precoMedioAtual: 30.5,
      quantidade: 100,
      valorAtualAcao: 3050,
      ganhos: 500,
      data: '2024-01-15',
    },
  ];

  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let originalCreateElement: (tag: string) => HTMLElement;
    let mockAnchor: HTMLAnchorElement;

  afterEach(() => {
    createElementSpy?.mockRestore();
    appendChildSpy?.mockRestore();
    removeChildSpy?.mockRestore();
    vi.useRealTimers();
  });

  beforeEach(async () => {
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    } as HTMLAnchorElement;
    originalCreateElement = document.createElement.bind(document);
    ordersServiceMock = {
      exportSellSnapshotsSpreadsheet: vi.fn(),
      getSellSnapshotsForPdf: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ExportacaoComponent],
      providers: [{ provide: OrdersService, useValue: ordersServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExportacaoComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve setar alert corretamente', () => {
    component['pushAlert']('error', 'Erro Teste', 'Mensagem de erro', '✕');

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].title).toBe('Erro Teste');
    expect(component.alerts()[0].message).toBe('Mensagem de erro');
    expect(component.alerts()[0].icon).toBe('✕');
  });

  it('deve gerar HTML válido no buildOrderSellPrintHtml', () => {
    const html = component['buildOrderSellPrintHtml'](baseRows);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('OrderSell - Exportação PDF');
    expect(html).toContain('PETR4');
    expect(html).toContain('30,50');
    expect(html).toContain('100');
    expect(html).toContain('3.050,00');
    expect(html).toContain('500,00');
    expect(html).toContain('2024-01-15');
  });

  it('deve gerar HTML com escaping correto para caracteres especiais', () => {
    const rowsWithSpecialChars: SellSnapshotExportRow[] = [
      {
        codigo: '<script>alert("xss")</script>',
        precoMedioAtual: 10,
        quantidade: 5,
        valorAtualAcao: 50,
        ganhos: 0,
        data: '2024-01-01',
      },
    ];

    const html = component['buildOrderSellPrintHtml'](rowsWithSpecialChars);

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('deve gerar HTML vazio quando array vazio', () => {
    const html = component['buildOrderSellPrintHtml']([]);

    expect(html).toContain('<tbody>');
    expect(html).not.toContain('<td>');
  });

  it('deve remover alert no handleAlertDismiss', () => {
    const alert = { variant: 'info', title: 'Sucesso', message: 'ok', icon: '✓' } as const;
    component.alerts.set([
      alert,
      { variant: 'error', title: 'Erro', message: 'falhou', icon: '✕' },
    ]);

    component.handleAlertDismiss(alert);

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
  });

  it('deve conter lista de anos de 2020 ate o ano atual', () => {
    const anoAtual = new Date().getFullYear();
    expect(component.anos.length).toBe(anoAtual - 2020 + 1);
    expect(component.anos[0].value).toBe(String(anoAtual));
    expect(component.anos[component.anos.length - 1].value).toBe('2020');
  });

  it('deve atualizar anoFiltro ao chamar onAnoChange', () => {
    component.onAnoChange('2024');
    expect(component.anoFiltro()).toBe('2024');
  });

  it('deve exportar ordem venda em Excel com sucesso', () => {
    const mockBlob = new Blob(['test'], { type: 'application/vnd.ms-excel' });
    ordersServiceMock.exportSellSnapshotsSpreadsheet.mockReturnValue(of(mockBlob));

    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return mockAnchor as HTMLAnchorElement;
      }
      return originalCreateElement(tag);
    });

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor as HTMLAnchorElement);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor as HTMLAnchorElement);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    component.exportarOrderSellExcel();

    expect(ordersServiceMock.exportSellSnapshotsSpreadsheet).toHaveBeenCalled();
  });

  it('deve passar ano filtro ao exportar Excel quando ano selecionado', () => {
    component.onAnoChange('2024');
    ordersServiceMock.exportSellSnapshotsSpreadsheet.mockReturnValue(of(new Blob()));

    component.exportarOrderSellExcel();

    expect(ordersServiceMock.exportSellSnapshotsSpreadsheet).toHaveBeenCalledWith('2024');
  });

  it('deve passar ano filtro ao exportar PDF quando ano selecionado', () => {
    component.onAnoChange('2025');
    ordersServiceMock.getSellSnapshotsForPdf.mockReturnValue(of([]));

    component.exportarOrderSellPdf();

    expect(ordersServiceMock.getSellSnapshotsForPdf).toHaveBeenCalledWith('2025');
  });

  it('deve tratar erro ao exportar Excel', () => {
    ordersServiceMock.exportSellSnapshotsSpreadsheet.mockReturnValue(throwError(() => new Error('erro')));

    component.exportarOrderSellExcel();

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível exportar o OrderSell em Excel.');
  });

  it('deve exportar ordem venda em PDF com dados', () => {
    ordersServiceMock.getSellSnapshotsForPdf.mockReturnValue(of(baseRows));

    const html = component['buildOrderSellPrintHtml'](baseRows);
    expect(html).toContain('OrderSell - Exportação PDF');
    expect(html).toContain('PETR4');
  });

  it('deve tratar erro quando frame não existe no exportarOrderSellPdf', () => {
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(null);

    component.exportarOrderSellPdf();

    expect(ordersServiceMock.getSellSnapshotsForPdf).not.toHaveBeenCalled();
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');

    getElementByIdSpy.mockRestore();
  });

  it('deve tratar erro ao carregar dados para PDF', () => {
    ordersServiceMock.getSellSnapshotsForPdf.mockReturnValue(throwError(() => new Error('erro')));

    component.exportarOrderSellPdf();

    expect(ordersServiceMock.getSellSnapshotsForPdf).toHaveBeenCalled();
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível carregar os dados de OrderSell para o PDF.');
  });

  it('deve tratar erro quando iframe não existe para exportarAcoesEmPdf', () => {
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(null);

    component.exportarAcoesEmPdf();

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');

    getElementByIdSpy.mockRestore();
  });

  it('deve exportar acoes em PDF com sucesso', () => {
    vi.useFakeTimers();

    const mockPrint = vi.fn();
    const mockFocus = vi.fn();
    const mockFrame = {
      contentWindow: { focus: mockFocus, print: mockPrint },
      src: '',
      addEventListener: vi.fn((_event: string, handler: () => void) => handler()),
      removeEventListener: vi.fn(),
    };
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockFrame as HTMLIFrameElement);

    component.exportarAcoesEmPdf();

    expect(component.isExportingAcoes()).toBe(true);
    expect(mockFrame.src).toContain('/acoes?print=1');

    vi.runAllTimers();

    expect(mockFocus).toHaveBeenCalled();
    expect(mockPrint).toHaveBeenCalled();
    expect(component.isExportingAcoes()).toBe(false);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('info');

    getElementByIdSpy.mockRestore();
  });

  it('deve tratar erro quando contentWindow e null no exportarAcoesEmPdf', () => {
    vi.useFakeTimers();

    const mockFrame = {
      contentWindow: null,
      src: '',
      addEventListener: vi.fn((_event: string, handler: () => void) => handler()),
      removeEventListener: vi.fn(),
    };
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockFrame as HTMLIFrameElement);

    component.exportarAcoesEmPdf();

    vi.runAllTimers();

    expect(component.isExportingAcoes()).toBe(false);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível iniciar a exportação em PDF.');

    getElementByIdSpy.mockRestore();
  });

  it('deve exportar order sell em PDF com sucesso', () => {
    vi.useFakeTimers();

    ordersServiceMock.getSellSnapshotsForPdf.mockReturnValue(of(baseRows));

    const mockPrint = vi.fn();
    const mockFocus = vi.fn();
    const mockFrame = {
      contentWindow: { focus: mockFocus, print: mockPrint },
      srcdoc: '',
      addEventListener: vi.fn((_event: string, handler: () => void) => handler()),
      removeEventListener: vi.fn(),
    };
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockFrame as HTMLIFrameElement);

    component.exportarOrderSellPdf();

    expect(component.isExportingOrderSellPdf()).toBe(true);
    expect(ordersServiceMock.getSellSnapshotsForPdf).toHaveBeenCalled();
    expect(mockFrame.srcdoc).toContain('OrderSell - Exportação PDF');

    vi.runAllTimers();

    expect(mockFocus).toHaveBeenCalled();
    expect(mockPrint).toHaveBeenCalled();
    expect(component.isExportingOrderSellPdf()).toBe(false);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('info');

    getElementByIdSpy.mockRestore();
  });

  it('deve tratar erro quando contentWindow e null no exportarOrderSellPdf', () => {
    vi.useFakeTimers();

    ordersServiceMock.getSellSnapshotsForPdf.mockReturnValue(of(baseRows));

    const mockFrame = {
      contentWindow: null,
      srcdoc: '',
      addEventListener: vi.fn((_event: string, handler: () => void) => handler()),
      removeEventListener: vi.fn(),
    };
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockFrame as HTMLIFrameElement);

    component.exportarOrderSellPdf();

    vi.runAllTimers();

    expect(component.isExportingOrderSellPdf()).toBe(false);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível iniciar a exportação de OrderSell em PDF.');

    getElementByIdSpy.mockRestore();
  });

  it('deve resetar isExportingOrderSellExcel apos conclusao', () => {
    ordersServiceMock.exportSellSnapshotsSpreadsheet.mockReturnValue(of(new Blob()));

    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return mockAnchor as HTMLAnchorElement;
      }
      return originalCreateElement(tag);
    });
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor as HTMLAnchorElement);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor as HTMLAnchorElement);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    component.exportarOrderSellExcel();

    expect(component.isExportingOrderSellExcel()).toBe(false);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('info');
  });

  it('deve manter todos os alerts quando nao encontra correspondencia no handleAlertDismiss', () => {
    const alert1 = { variant: 'info', title: 'A', message: 'a', icon: '!' } as const;
    const alert2 = { variant: 'error', title: 'B', message: 'b', icon: '✕' } as const;
    component.alerts.set([alert1, alert2]);

    component.handleAlertDismiss({ variant: 'warning', title: 'C', message: 'c', icon: '?' });

    expect(component.alerts().length).toBe(2);
  });
});
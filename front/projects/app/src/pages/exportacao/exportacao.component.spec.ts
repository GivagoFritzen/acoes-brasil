import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SellSnapshotExportRow } from '../../models/sell-snapshot-export-row.model';
import { OrdersService } from '../../services/orders.service';
import { ExportacaoComponent } from './exportacao.component';

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

  beforeEach(async () => {
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

  it('deve exportar ordem venda em Excel com sucesso', () => {
    const mockBlob = new Blob(['test'], { type: 'application/vnd.ms-excel' }) as any;
    ordersServiceMock.exportSellSnapshotsSpreadsheet.mockReturnValue(of(mockBlob));

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
          remove: vi.fn(),
        } as unknown as HTMLElement;
      }
      return document.createElement(tag);
    });

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    component.exportarOrderSellExcel();

    expect(ordersServiceMock.exportSellSnapshotsSpreadsheet).toHaveBeenCalled();

    createElementSpy.mockRestore();
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
});
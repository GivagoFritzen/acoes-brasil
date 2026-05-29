import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdersService } from '../../services/OrdersService';
import { ProventosService } from '../../services/ProventosService';
import { ImportacaoComponent } from './ImportacaoComponent';

describe('ImportacaoComponent', () => {
  let component: ImportacaoComponent;
  let ordersServiceMock: { importOrdersSpreadsheet: ReturnType<typeof vi.fn> };
  let proventosServiceMock: { importProventosSpreadsheet: ReturnType<typeof vi.fn> };

  const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.ms-excel' });

  beforeEach(async () => {
    ordersServiceMock = {
      importOrdersSpreadsheet: vi.fn(),
    };
    proventosServiceMock = {
      importProventosSpreadsheet: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ImportacaoComponent],
      providers: [
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: ProventosService, useValue: proventosServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ImportacaoComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve setar arquivo de negociação no handleNegociacaoFileChange', () => {
    component.handleNegociacaoFileChange(mockFile);

    expect(component.negociacaoFile()).toEqual(mockFile);
  });

  it('deve setar arquivo de provento no handleProventoFileChange', () => {
    component.handleProventoFileChange(mockFile);

    expect(component.proventoFile()).toEqual(mockFile);
  });

  it('deve importar negociação com sucesso', () => {
    const response = { imported: 10 };
    ordersServiceMock.importOrdersSpreadsheet.mockReturnValue(of(response));
    component.negociacaoFile.set(mockFile);

    component.importarNegociacao();

    expect(ordersServiceMock.importOrdersSpreadsheet).toHaveBeenCalledWith(mockFile);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('info');
    expect(component.alerts()[0].message).toBe('10 negociações importadas com sucesso.');
    expect(component.negociacaoFile()).toBeNull();
    expect(component.isImportingNegociacao()).toBe(false);
  });

  it('deve tratar erro ao importar negociação', () => {
    const error = { error: { error: 'Erro específico' } } as unknown as HttpErrorResponse;
    ordersServiceMock.importOrdersSpreadsheet.mockReturnValue(throwError(() => error));
    component.negociacaoFile.set(mockFile);

    component.importarNegociacao();

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Erro específico');
    expect(component.isImportingNegociacao()).toBe(false);
  });

  it('deve exibir warning quando não há arquivo para importação de negociação', () => {
    component.negociacaoFile.set(null);

    component.importarNegociacao();

    expect(ordersServiceMock.importOrdersSpreadsheet).not.toHaveBeenCalled();
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('warning');
    expect(component.alerts()[0].message).toBe('Selecione um arquivo de negociação para importar.');
  });

  it('deve importar proventos com sucesso', () => {
    const response = { imported: 5 };
    proventosServiceMock.importProventosSpreadsheet.mockReturnValue(of(response));
    component.proventoFile.set(mockFile);

    component.importarProventos();

    expect(proventosServiceMock.importProventosSpreadsheet).toHaveBeenCalledWith(mockFile);
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('info');
    expect(component.alerts()[0].message).toBe('5 proventos importados com sucesso.');
    expect(component.proventoFile()).toBeNull();
    expect(component.isImportingProvento()).toBe(false);
  });

  it('deve tratar erro ao importar proventos', () => {
    const error = { error: { message: 'Erro de mensagem' } } as unknown as HttpErrorResponse;
    proventosServiceMock.importProventosSpreadsheet.mockReturnValue(throwError(() => error));
    component.proventoFile.set(mockFile);

    component.importarProventos();

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Erro de mensagem');
    expect(component.isImportingProvento()).toBe(false);
  });

  it('deve exibir warning quando não há arquivo para importação de proventos', () => {
    component.proventoFile.set(null);

    component.importarProventos();

    expect(proventosServiceMock.importProventosSpreadsheet).not.toHaveBeenCalled();
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('warning');
    expect(component.alerts()[0].message).toBe('Selecione um arquivo de proventos para importar.');
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

  it('deve setar alert corretamente', () => {
    component['pushAlert']('error', 'Erro Teste', 'Mensagem de erro', '✕');

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].title).toBe('Erro Teste');
    expect(component.alerts()[0].message).toBe('Mensagem de erro');
    expect(component.alerts()[0].icon).toBe('✕');
  });

  it('deve tratar erro genérico ao importar negociação quando error sem mensagem específica', () => {
    const error = {} as HttpErrorResponse;
    ordersServiceMock.importOrdersSpreadsheet.mockReturnValue(throwError(() => error));
    component.negociacaoFile.set(mockFile);

    component.importarNegociacao();

    expect(component.alerts()[0].message).toBe('Não foi possível importar a planilha de negociação.');
  });

  it('deve tratar erro genérico ao importar proventos quando error sem mensagem específica', () => {
    const error = {} as HttpErrorResponse;
    proventosServiceMock.importProventosSpreadsheet.mockReturnValue(throwError(() => error));
    component.proventoFile.set(mockFile);

    component.importarProventos();

    expect(component.alerts()[0].message).toBe('Não foi possível importar a planilha de proventos.');
  });
});
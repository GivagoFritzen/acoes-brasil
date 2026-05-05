import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  const browserPlatformId = 'browser' as unknown as object;

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve salvar e recuperar itens no browser', () => {
    const service = new LocalStorageService(browserPlatformId);
    const item = { codigo: 'PETR4', precoAtual: 10 } as any;

    service.save(item);

    expect(service.getAll()).toEqual([item]);
  });

  it('deve atualizar item existente pelo código', () => {
    const service = new LocalStorageService(browserPlatformId);
    service.save({ codigo: 'PETR4', precoAtual: 10 } as any);

    service.save({ codigo: 'PETR4', precoAtual: 20 } as any);

    expect(service.getAll()).toEqual([{ codigo: 'PETR4', precoAtual: 20 }]);
  });

  it('deve remover item por código normalizado', () => {
    const service = new LocalStorageService(browserPlatformId);
    service.save({ codigo: 'PETR4', precoAtual: 10 } as any);

    service.removeByCodigo(' petr4 ');

    expect(service.getAll()).toEqual([]);
  });
});

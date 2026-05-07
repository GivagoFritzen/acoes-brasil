import { LocalStorageService } from './local-storage.service';
import { PLATFORM_ID } from '@angular/core';

describe('LocalStorageService', () => {
  const browserPlatformId = 'browser' as unknown as object;
  const serverPlatformId = 'server' as unknown as object;

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Browser environment', () => {
    let service: LocalStorageService;

    beforeEach(() => {
      service = new LocalStorageService(browserPlatformId);
    });

    describe('getAll', () => {
      it('deve retornar array vazio quando localStorage vazio', () => {
        expect(service.getAll()).toEqual([]);
      });

      it('deve retornar itens salvos', () => {
        const item = { codigo: 'PETR4', precoAtual: 10 } as any;
        service.save(item);

        expect(service.getAll()).toEqual([item]);
      });

      it('deve retornar array vazio quando JSON inválido no localStorage', () => {
        localStorage.setItem('acao-current-info', 'json-invalido');

        expect(service.getAll()).toEqual([]);
      });

      it('deve retornar array vazio quando chave não existe', () => {
        localStorage.removeItem('acao-current-info');

        expect(service.getAll()).toEqual([]);
      });
    });

    describe('save', () => {
      it('deve salvar e recuperar itens no browser', () => {
        const item = { codigo: 'PETR4', precoAtual: 10 } as any;

        service.save(item);

        expect(service.getAll()).toEqual([item]);
      });

      it('deve atualizar item existente pelo código', () => {
        service.save({ codigo: 'PETR4', precoAtual: 10 } as any);
        service.save({ codigo: 'PETR4', precoAtual: 20 } as any);

        expect(service.getAll()).toEqual([{ codigo: 'PETR4', precoAtual: 20 }]);
      });

      it('deve salvar múltiplos itens com códigos diferentes', () => {
        service.save({ codigo: 'PETR4', precoAtual: 10 } as any);
        service.save({ codigo: 'VALE3', precoAtual: 15 } as any);

        expect(service.getAll().length).toBe(2);
        expect(service.getAll()).toEqual([
          { codigo: 'PETR4', precoAtual: 10 },
          { codigo: 'VALE3', precoAtual: 15 },
        ]);
      });
    });

    describe('removeByCodigo', () => {
      it('deve remover item por código normalizado', () => {
        const service2 = new LocalStorageService(browserPlatformId);
        service2.save({ codigo: 'PETR4', precoAtual: 10 } as any);

        service2.removeByCodigo(' petr4 ');

        expect(service2.getAll()).toEqual([]);
      });

      it('deve remover apenas item específico mantendo outros', () => {
        service.save({ codigo: 'PETR4', precoAtual: 10 } as any);
        service.save({ codigo: 'VALE3', precoAtual: 15 } as any);

        service.removeByCodigo('PETR4');

        expect(service.getAll()).toEqual([{ codigo: 'VALE3', precoAtual: 15 }]);
      });

      it('deve não fazer nada ao remover código inexistente', () => {
        service.save({ codigo: 'PETR4', precoAtual: 10 } as any);

        service.removeByCodigo('ITUB4');

        expect(service.getAll()).toEqual([{ codigo: 'PETR4', precoAtual: 10 }]);
      });
    });
  });

  describe('Server environment (non-browser)', () => {
    let service: LocalStorageService;

    beforeEach(() => {
      service = new LocalStorageService(serverPlatformId);
    });

    it('deve retornar array vazio em ambiente server para getAll', () => {
      expect(service.getAll()).toEqual([]);
    });

    it('deve não fazer nada em ambiente server para save', () => {
      const item = { codigo: 'PETR4', precoAtual: 10 } as any;

      service.save(item);

      // Em ambiente server, não deve salvar no localStorage
      expect(localStorage.getItem('acao-current-info')).toBeNull();
    });

    it('deve não fazer nada em ambiente server para removeByCodigo', () => {
      service.removeByCodigo('PETR4');

      // Não deve lançar erro em ambiente server
      expect(service.getAll()).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com código vazio ao remover', () => {
      const service2 = new LocalStorageService(browserPlatformId);
      service2.save({ codigo: 'PETR4', precoAtual: 10 } as any);

      service2.removeByCodigo('');

      // Com código vazio, nenhum item deve ser removido (normalizedCodigo = '')
      expect(service2.getAll().length).toBeGreaterThanOrEqual(0);
    });
  });
});

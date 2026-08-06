import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TranslationService } from './TranslationService';
import { HttpClient } from '@angular/common/http';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: 'HttpClient', useValue: httpMock },
      ],
    });

    service = TestBed.inject(TranslationService);
    (service as unknown as { http: HttpClient }).http = httpMock as unknown as HttpClient;
  });

  describe('loadLanguage', () => {
    it('deve carregar idioma e resolver chaves aninhadas', async () => {
      httpMock.get.mockReturnValue(of({ common: { save: 'Salvar' } }));

      await service.loadLanguage('pt-BR');

      expect(service.getCurrentLanguage()).toBe('pt-BR');
      expect(service.get('common.save')).toBe('Salvar');
      expect(service.has('common.save')).toBe(true);
    });

    it('deve tratar erro HTTP e definir traduções vazias', async () => {
      httpMock.get.mockReturnValue(throwError(() => new Error('Network error')));

      await service.loadLanguage('en-US');

      expect(service.getCurrentLanguage()).toBe('en-US');
      expect(service.get('common.save')).toBe('');
    });
  });

  describe('get', () => {
    it('deve retornar string vazia para chave inexistente', async () => {
      httpMock.get.mockReturnValue(of({}));
      const service2 = new TranslationService(httpMock as unknown as HttpClient);
      await service2.loadLanguage('pt-BR');

      expect(service2.get('inexistente.chave')).toBe('');
    });

    it('deve resolver chaves aninhadas profundamente', async () => {
      httpMock.get.mockReturnValue(of({ a: { b: { c: 'valor' } } }));
      const service2 = new TranslationService(httpMock as unknown as HttpClient);
      await service2.loadLanguage('pt-BR');

      expect(service2.get('a.b.c')).toBe('valor');
    });
  });

  describe('has', () => {
    it('deve retornar true para chave existente', async () => {
      httpMock.get.mockReturnValue(of({ existe: 'sim' }));
      const service2 = new TranslationService(httpMock as unknown as HttpClient);
      await service2.loadLanguage('pt-BR');

      expect(service2.has('existe')).toBe(true);
    });

    it('deve retornar false para chave inexistente', async () => {
      httpMock.get.mockReturnValue(of({}));
      const service2 = new TranslationService(httpMock as unknown as HttpClient);
      await service2.loadLanguage('pt-BR');

      expect(service2.has('naoexiste')).toBe(false);
    });
  });

  describe('getCurrentLanguage', () => {
    it('deve retornar idioma atual após carregar', async () => {
      httpMock.get.mockReturnValue(of({}));
      const service2 = new TranslationService(httpMock as unknown as HttpClient);
      await service2.loadLanguage('fr-FR');

      expect(service2.getCurrentLanguage()).toBe('fr-FR');
    });

    it('deve retornar idioma padrão antes de carregar', () => {
      const service2 = new TranslationService(httpMock as unknown as HttpClient);
      expect(service2.getCurrentLanguage()).toBe('pt-BR');
    });
  });
});

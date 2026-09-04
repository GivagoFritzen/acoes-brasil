import { languageMiddleware } from './middleware';
import { translationService } from './TranslationService';

describe('languageMiddleware', () => {
  it('deve extrair idioma do header Accept-Language', (done) => {
    const req = {
      headers: {
        'accept-language': 'en-US,en;q=0.9'
      },
      language: '',
      t: null as any
    } as any;

    const res = {} as any;
    const next = jest.fn(() => done());

    languageMiddleware(req, res, next);

    expect(req.language).toBe('en-US');
  });

  it('deve usar pt-BR como padrão quando header não existe', (done) => {
    const req = {
      headers: {},
      language: '',
      t: null as any
    } as any;

    const res = {} as any;
    const next = jest.fn(() => done());

    languageMiddleware(req, res, next);

    expect(req.language).toBe('pt-BR');
  });

  it('deve adicionar função t ao request', (done) => {
    const req = {
      headers: {
        'accept-language': 'pt-BR'
      },
      language: '',
      t: null as any
    } as any;

    const res = {} as any;
    const next = jest.fn(() => {
      expect(typeof req.t).toBe('function');
      expect(req.t('order.notFound')).toBe('Ordem não encontrada.');
      done();
    });

    languageMiddleware(req, res, next);
  });

  it('deve usar idioma do header para traduzir', (done) => {
    const req = {
      headers: {
        'accept-language': 'en-US'
      },
      language: '',
      t: null as any
    } as any;

    const res = {} as any;
    const next = jest.fn(() => {
      expect(req.t('order.notFound')).toBe('Order not found.');
      done();
    });

    languageMiddleware(req, res, next);
  });

  it('deve isolar idiomas entre requests concorrentes', async () => {
    const resultados: string[] = [];

    const createRequest = (lang: string) => ({
      headers: { 'accept-language': lang },
      language: '',
      t: null as any
    } as any);

    const res = {} as any;

    const promise1 = new Promise<void>((resolve) => {
      const req1 = createRequest('en-US');
      languageMiddleware(req1, res, () => {
        setTimeout(() => {
          resultados.push(req1.t('order.notFound'));
          resolve();
        }, 10);
      });
    });

    const promise2 = new Promise<void>((resolve) => {
      const req2 = createRequest('pt-BR');
      languageMiddleware(req2, res, () => {
        setTimeout(() => {
          resultados.push(req2.t('order.notFound'));
          resolve();
        }, 5);
      });
    });

    await Promise.all([promise1, promise2]);

    expect(resultados).toContain('Order not found.');
    expect(resultados).toContain('Ordem não encontrada.');
    expect(resultados).toHaveLength(2);
  });
});

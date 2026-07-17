import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsService } from './SettingsService';

const STORAGE_KEY_LANG = 'app_language';
const STORAGE_KEY_THEME = 'app_theme';
const STORAGE_KEY_MODULES = 'app_visible_modules';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    service = new SettingsService();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('inicialização', () => {
    it('deve iniciar com theme light', () => {
      expect(service.theme()).toBe('light');
    });

    it('deve iniciar com language pt-BR', () => {
      expect(service.language()).toBe('pt-BR');
    });

    it('deve carregar language salva do localStorage', () => {
      localStorage.setItem(STORAGE_KEY_LANG, 'en-US');
      const svc = new SettingsService();
      expect(svc.language()).toBe('en-US');
    });

    it('deve carregar theme salva do localStorage', () => {
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
      const svc = new SettingsService();
      expect(svc.theme()).toBe('dark');
    });

    it('deve iniciar com wallet visivel', () => {
      expect(service.visibleModules().wallet).toBe(true);
    });

    it('deve iniciar com composition visivel', () => {
      expect(service.visibleModules().composition).toBe(true);
    });

    it('deve iniciar com profitability invisivel', () => {
      expect(service.visibleModules().profitability).toBe(false);
    });

    it('deve carregar visibleModules salva do localStorage', () => {
      localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify({ wallet: false, composition: false, profitability: true }));
      const svc = new SettingsService();
      expect(svc.visibleModules().wallet).toBe(false);
      expect(svc.visibleModules().composition).toBe(false);
      expect(svc.visibleModules().profitability).toBe(true);
    });

    it('deve usar valores default para campos faltantes no localStorage', () => {
      localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify({ wallet: false }));
      const svc = new SettingsService();
      expect(svc.visibleModules().wallet).toBe(false);
      expect(svc.visibleModules().composition).toBe(true);
      expect(svc.visibleModules().profitability).toBe(false);
    });

    it('deve lidar com JSON invalido no localStorage', () => {
      localStorage.setItem(STORAGE_KEY_MODULES, 'invalido');
      const svc = new SettingsService();
      expect(svc.visibleModules().wallet).toBe(true);
      expect(svc.visibleModules().composition).toBe(true);
      expect(svc.visibleModules().profitability).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('deve atualizar theme signal', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
    });

    it('deve salvar theme no localStorage', () => {
      service.setTheme('dark');
      expect(localStorage.getItem(STORAGE_KEY_THEME)).toBe('dark');
    });

    it('deve aplicar atributo data-theme no HTML quando dark', () => {
      service.setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('deve remover atributo data-theme quando light', () => {
      service.setTheme('dark');
      service.setTheme('light');
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('deve lidar com erro ao salvar no localStorage', () => {
      const setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => { throw new Error('erro'); });
      expect(() => service.setTheme('dark')).not.toThrow();
      Storage.prototype.setItem = setItemOriginal;
    });
  });

  describe('setLanguage', () => {
    it('deve atualizar language signal', () => {
      service.setLanguage('en-US');
      expect(service.language()).toBe('en-US');
    });

    it('deve salvar language no localStorage', () => {
      service.setLanguage('en-US');
      expect(localStorage.getItem(STORAGE_KEY_LANG)).toBe('en-US');
    });

    it('deve lidar com erro ao salvar no localStorage', () => {
      const setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => { throw new Error('erro'); });
      expect(() => service.setLanguage('en-US')).not.toThrow();
      Storage.prototype.setItem = setItemOriginal;
    });
  });

  describe('toggleModule', () => {
    it('deve inverter wallet de true para false', () => {
      service.toggleModule('wallet');
      expect(service.visibleModules().wallet).toBe(false);
    });

    it('deve inverter wallet de false para true', () => {
      service.toggleModule('wallet');
      service.toggleModule('wallet');
      expect(service.visibleModules().wallet).toBe(true);
    });

    it('deve inverter composition de true para false', () => {
      service.toggleModule('composition');
      expect(service.visibleModules().composition).toBe(false);
    });

    it('deve inverter profitability de false para true', () => {
      service.toggleModule('profitability');
      expect(service.visibleModules().profitability).toBe(true);
    });

    it('deve persistir estado alterado no localStorage', () => {
      service.toggleModule('profitability');
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES)!);
      expect(saved.profitability).toBe(true);
    });

    it('deve manter outros modulos inalterados ao alternar um', () => {
      service.toggleModule('profitability');
      expect(service.visibleModules().wallet).toBe(true);
      expect(service.visibleModules().composition).toBe(true);
      expect(service.visibleModules().profitability).toBe(true);
    });

    it('deve lidar com erro ao salvar no localStorage', () => {
      const setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => { throw new Error('erro'); });
      expect(() => service.toggleModule('wallet')).not.toThrow();
      Storage.prototype.setItem = setItemOriginal;
    });
  });
});

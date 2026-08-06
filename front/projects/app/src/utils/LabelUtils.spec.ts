import { normalizeLabel } from './LabelUtils';

describe('normalizeLabel', () => {
  it('Deve normalizar label simples', () => {
    expect(normalizeLabel('Cotacao')).toBe('Cotacao');
  });

  it('Deve remover acentos', () => {
    expect(normalizeLabel('Cotação')).toBe('Cotacao');
  });

  it('Deve remover acento de acao', () => {
    expect(normalizeLabel('ação')).toBe('acao');
  });

  it('Deve remover espacos', () => {
    expect(normalizeLabel('Preco Medio')).toBe('PrecoMedio');
  });

  it('Deve remover barras', () => {
    expect(normalizeLabel('Dividendos/Lucros')).toBe('DividendosLucros');
  });

  it('Deve remover pontos', () => {
    expect(normalizeLabel('Mrp.')).toBe('Mrp');
  });

  it('Deve remover parenteses', () => {
    expect(normalizeLabel('ROE (%)')).toBe('ROE');
  });

  it('Deve remover cifrao', () => {
    expect(normalizeLabel('Preço $')).toBe('Preco');
  });

  it('Deve remover porcentagem', () => {
    expect(normalizeLabel('Margem %')).toBe('Margem');
  });

  it('Deve remover virgula', () => {
    expect(normalizeLabel('1,234')).toBe('1234');
  });

  it('Deve remover doisPontos', () => {
    expect(normalizeLabel('10:30')).toBe('1030');
  });

  it('Deve remover hifen', () => {
    expect(normalizeLabel('2024-01-01')).toBe('20240101');
  });

  it('Deve retornar string vazia para entrada vazia', () => {
    expect(normalizeLabel('')).toBe('');
  });

  it('Deve combinar múltiplas normalizacoes', () => {
    expect(normalizeLabel('Cotação (R$)')).toBe('CotacaoR');
  });

  it('Deve manter caracteres normais', () => {
    expect(normalizeLabel('ABC123')).toBe('ABC123');
  });
});

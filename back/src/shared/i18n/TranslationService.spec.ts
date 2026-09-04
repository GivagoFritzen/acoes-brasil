import { translationService } from './TranslationService';

describe('TranslationService', () => {
  it('deve traduzir chave simples em português', () => {
    const result = translationService.translate('order.notFound', 'pt-BR');
    expect(result).toBe('Ordem não encontrada.');
  });

  it('deve traduzir chave simples em inglês', () => {
    const result = translationService.translate('order.notFound', 'en-US');
    expect(result).toBe('Order not found.');
  });

  it('deve retornar chave original se não encontrar tradução', () => {
    const result = translationService.translate('chave.inexistente');
    expect(result).toBe('chave.inexistente');
  });

  it('deve interpoler parâmetros', () => {
    const result = translationService.translate('portfolio.assetSoldNotInPortfolio', 'pt-BR', { codigo: 'PETR4' });
    expect(result).toBe('Ativo PETR4 vendido sem existir no portfólio');
  });

  it('deve interpoler múltiplos parâmetros', () => {
    const result = translationService.translate('portfolio.sellWouldLeaveNegativeQuantity', 'pt-BR', { codigo: 'VALE3', quantidade: -5 });
    expect(result).toBe('Ativo VALE3 vendido deixaria portfólio com quantidade -5 (mínimo 1)');
  });

  it('deve usar pt-BR como padrão quando lang não informado', () => {
    const result = translationService.translate('order.notFound');
    expect(result).toBe('Ordem não encontrada.');
  });

  it('deve aceitar idioma suportado com prefixo', () => {
    const result = translationService.translate('order.notFound', 'pt');
    expect(result).toBe('Ordem não encontrada.');
  });

  it('deve retornar pt-BR para idioma não suportado', () => {
    const result = translationService.translate('order.notFound', 'fr-FR');
    expect(result).toBe('Ordem não encontrada.');
  });

  it('deve usar translateForKey com idioma explícito', () => {
    const result = translationService.translateForKey('order.notFound', 'en-US');
    expect(result).toBe('Order not found.');
  });
});

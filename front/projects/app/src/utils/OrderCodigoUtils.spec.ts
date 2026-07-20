import { normalizeOrderCodigo, isCodigoFormatoValido, removerSufixoF, mesclarPorCodigo } from '../../../../../common/utils/OrderCodigoUtils';

describe('normalizeOrderCodigo', () => {
  describe('Deve_retornar_string_vazia_quando_receber_null', () => {
    it('deve retornar string vazia quando input for null', () => {
      const resultado = normalizeOrderCodigo(null!);
      expect(resultado).toBe('');
    });
  });

  describe('Deve_retornar_string_vazia_quando_receber_undefined', () => {
    it('deve retornar string vazia quando input for undefined', () => {
      const resultado = normalizeOrderCodigo(undefined!);
      expect(resultado).toBe('');
    });
  });

  describe('Deve_converter_para_maiusculo', () => {
    it('deve converter para maiúsculo', () => {
      const resultado = normalizeOrderCodigo('petr4');
      expect(resultado).toBe('PETR4');
    });
  });

  describe('Deve_remover_espacos_laterais', () => {
    it('deve remover espaços laterais', () => {
      const resultado = normalizeOrderCodigo('  PETR4  ');
      expect(resultado).toBe('PETR4');
    });
  });

  describe('Deve_remover_espacos_internos', () => {
    it('deve remover espaços internos', () => {
      const resultado = normalizeOrderCodigo('PET R4');
      expect(resultado).toBe('PETR4');
    });
  });
});

describe('isCodigoFormatoValido', () => {
  describe('Deve_retornar_true_para_acao_sem_F', () => {
    it('deve retornar true para código PETR4', () => {
      const resultado = isCodigoFormatoValido('PETR4');
      expect(resultado).toBe(true);
    });
  });

  describe('Deve_retornar_true_para_acao_com_F', () => {
    it('deve retornar true para código PETR4F', () => {
      const resultado = isCodigoFormatoValido('PETR4F');
      expect(resultado).toBe(true);
    });
  });

  describe('Deve_retornar_true_para_FII', () => {
    it('deve retornar true para código TAEE11', () => {
      const resultado = isCodigoFormatoValido('TAEE11');
      expect(resultado).toBe(true);
    });
  });

  describe('Deve_retornar_true_para_BDR', () => {
    it('deve retornar true para código AAPL34', () => {
      const resultado = isCodigoFormatoValido('AAPL34');
      expect(resultado).toBe(true);
    });
  });

  describe('Deve_retornar_false_para_codigo_vazio', () => {
    it('deve retornar false para string vazia', () => {
      const resultado = isCodigoFormatoValido('');
      expect(resultado).toBe(false);
    });
  });

  describe('Deve_retornar_false_para_formato_invalido', () => {
    it('deve retornar false para código com mais de 7 caracteres', () => {
      const resultado = isCodigoFormatoValido('PETR4XYZ');
      expect(resultado).toBe(false);
    });
  });

  describe('Deve_retornar_false_para_codigo_muito_curto', () => {
    it('deve retornar false para código com menos de 4 letras', () => {
      const resultado = isCodigoFormatoValido('ABC1');
      expect(resultado).toBe(false);
    });
  });

  describe('Deve_retornar_false_para_sufixo_invalido', () => {
    it('deve retornar false para código com FX', () => {
      const resultado = isCodigoFormatoValido('PETR4FX');
      expect(resultado).toBe(false);
    });
  });

  describe('Deve_retornar_false_para_somente_letras', () => {
    it('deve retornar false para código sem dígitos', () => {
      const resultado = isCodigoFormatoValido('PETR');
      expect(resultado).toBe(false);
    });
  });

  describe('Deve_normalizar_antes_de_validar', () => {
    it('deve retornar true para código com espaços', () => {
      const resultado = isCodigoFormatoValido('  petr4  ');
      expect(resultado).toBe(true);
    });
  });
});

describe('removerSufixoF', () => {
  describe('Deve_remover_F_quando_codigo_terminar_com_F', () => {
    it('deve remover F de PETR4F retornando PETR4', () => {
      const resultado = removerSufixoF('PETR4F');
      expect(resultado).toBe('PETR4');
    });
  });

  describe('Deve_manter_codigo_quando_nao_terminar_com_F', () => {
    it('deve manter PETR4 inalterado', () => {
      const resultado = removerSufixoF('PETR4');
      expect(resultado).toBe('PETR4');
    });
  });

  describe('Deve_manter_codigo_para_FII', () => {
    it('deve manter TAEE11 inalterado', () => {
      const resultado = removerSufixoF('TAEE11');
      expect(resultado).toBe('TAEE11');
    });
  });

  describe('Deve_manter_codigo_para_BDR', () => {
    it('deve manter AAPL34 inalterado', () => {
      const resultado = removerSufixoF('AAPL34');
      expect(resultado).toBe('AAPL34');
    });
  });

  describe('Deve_retornar_string_vazia_quando_receber_null', () => {
    it('deve retornar string vazia para null', () => {
      const resultado = removerSufixoF(null!);
      expect(resultado).toBe('');
    });
  });

  describe('Deve_retornar_string_vazia_quando_receber_string_vazia', () => {
    it('deve retornar string vazia para string vazia', () => {
      const resultado = removerSufixoF('');
      expect(resultado).toBe('');
    });
  });

  describe('Deve_manter_codigo_invalido_mesmo_com_F', () => {
    it('deve manter código inválido que termina com F', () => {
      const resultado = removerSufixoF('AB1F');
      expect(resultado).toBe('AB1F');
    });
  });

  describe('Deve_normalizar_antes_de_remover', () => {
    it('deve normalizar e remover F de código com espaços', () => {
      const resultado = removerSufixoF('  petr4f  ');
      expect(resultado).toBe('PETR4');
    });
  });
});

describe('mesclarPorCodigo', () => {
  describe('Deve_retornar_array_vazio_quando_receber_array_vazio', () => {
    it('deve retornar array vazio para input vazio', () => {
      const resultado = mesclarPorCodigo([]);
      expect(resultado).toEqual([]);
    });
  });

  describe('Deve_manter_unico_item_inalterado', () => {
    it('deve retornar mesmo array quando há apenas um item', () => {
      const items = [{ codigo: 'PETR4', quantidade: 100, precoMedio: 30 }];
      const resultado = mesclarPorCodigo(items);
      expect(resultado).toHaveLength(1);
      expect(resultado[0].codigo).toBe('PETR4');
      expect(resultado[0].quantidade).toBe(100);
    });
  });

  describe('Deve_mesclar_dois_itens_com_F_e_sem_F', () => {
    it('deve mesclar VALE3 e VALE3F em uma única entrada', () => {
      const items = [
        { codigo: 'VALE3', quantidade: 100, precoMedio: 40 },
        { codigo: 'VALE3F', quantidade: 50, precoMedio: 42 },
      ];

      const resultado = mesclarPorCodigo(items);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].codigo).toBe('VALE3');
      expect(resultado[0].quantidade).toBe(150);
    });
  });

  describe('Deve_calcular_preco_medio_ponderado_ao_mesclar', () => {
    it('deve calcular preço médio ponderado corretamente', () => {
      const items = [
        { codigo: 'VALE3', quantidade: 100, precoMedio: 40 },
        { codigo: 'VALE3F', quantidade: 50, precoMedio: 42 },
      ];

      const resultado = mesclarPorCodigo(items);
      const precoEsperado = (100 * 40 + 50 * 42) / 150;

      expect(resultado[0].precoMedio).toBe(precoEsperado);
    });
  });

  describe('Deve_manter_itens_separados_quando_codigos_diferentes', () => {
    it('deve manter PETR4 e VALE5 em entradas separadas', () => {
      const items = [
        { codigo: 'PETR4', quantidade: 100, precoMedio: 30 },
        { codigo: 'VALE5', quantidade: 50, precoMedio: 70 },
      ];

      const resultado = mesclarPorCodigo(items);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].codigo).toBe('PETR4');
      expect(resultado[1].codigo).toBe('VALE5');
    });
  });

  describe('Deve_mesclar_tres_itens_com_mesmo_codigo_base', () => {
    it('deve mesclar VALE3, VALE3F e vale3f em uma única entrada', () => {
      const items = [
        { codigo: 'VALE3', quantidade: 100, precoMedio: 40 },
        { codigo: 'VALE3F', quantidade: 50, precoMedio: 42 },
        { codigo: 'vale3f', quantidade: 100, precoMedio: 38 },
      ];

      const resultado = mesclarPorCodigo(items);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].codigo).toBe('VALE3');
      expect(resultado[0].quantidade).toBe(250);
    });
  });

  describe('Deve_mesclar_apenas_itens_com_F_quando_mesmo_codigo', () => {
    it('não deve mesclar PETR4 com PETR5 por terem dígitos diferentes', () => {
      const items = [
        { codigo: 'PETR4', quantidade: 100, precoMedio: 30 },
        { codigo: 'PETR5', quantidade: 50, precoMedio: 35 },
      ];

      const resultado = mesclarPorCodigo(items);

      expect(resultado).toHaveLength(2);
    });
  });
});

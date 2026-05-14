import { formatDateForDisplay } from './date.utils';

describe('formatDateForDisplay', () => {
  describe('Deve_retornar_string_vazia_quando_receber_null', () => {
    it('deve retornar string vazia quando input for null', () => {
      const resultado = formatDateForDisplay(null);
      expect(resultado).toBe('');
    });
  });

  describe('Deve_retornar_string_vazia_quando_receber_undefined', () => {
    it('deve retornar string vazia quando input for undefined', () => {
      const resultado = formatDateForDisplay(undefined);
      expect(resultado).toBe('');
    });
  });

  describe('Deve_formatar_date_valido_para_formato_brasileiro', () => {
    it('deve formatar objeto Date válido para formato brasileiro dd-mm-yyyy', () => {
      const date = new Date(2024, 4, 15);
      const resultado = formatDateForDisplay(date);
      expect(resultado).toBe('15-05-2024');
    });
  });

  describe('Deve_retornar_string_vazia_quando_date_invalido', () => {
    it('deve retornar string Invalid Date quando objeto Date for inválido', () => {
      const date = new Date(NaN);
      const resultado = formatDateForDisplay(date);
      expect(resultado).toBe('Invalid Date');
    });
  });

  describe('Deve_retornar_string_vazia_quando_receber_string_vazia', () => {
    it('deve retornar string vazia quando input for string vazia', () => {
      const resultado = formatDateForDisplay('');
      expect(resultado).toBe('');
    });
  });

  describe('Deve_retornar_string_vazia_quando_receber_string_com_espacos', () => {
    it('deve retornar string vazia quando input for string com apenas espaços', () => {
      const resultado = formatDateForDisplay('   ');
      expect(resultado).toBe('');
    });
  });

  describe('Deve_formatar_iso_date_para_formato_brasileiro', () => {
    it('deve formatar string ISO yyyy-mm-dd para formato brasileiro', () => {
      const resultado = formatDateForDisplay('2024-05-15');
      expect(resultado).toBe('15-05-2024');
    });
  });

  describe('Deve_ignorar_horario_em_iso_datetime', () => {
    it('deve ignorar o horário e retornar apenas a data no formato brasileiro', () => {
      const resultado = formatDateForDisplay('2024-05-15T10:30:00');
      expect(resultado).toBe('15-05-2024');
    });
  });

  describe('Deve_manter_formato_brasileiro_quando_já_brasileiro', () => {
    it('deve manter o formato brasileiro quando input já for dd-mm-yyyy', () => {
      const resultado = formatDateForDisplay('15-05-2024');
      expect(resultado).toBe('15-05-2024');
    });
  });

  describe('Deve_converter_barra_para_hifen_em_formato_brasileiro', () => {
    it('deve converter barras para hifens em formato brasileiro dd/mm/yyyy', () => {
      const resultado = formatDateForDisplay('15/05/2024');
      expect(resultado).toBe('15-05-2024');
    });
  });

  describe('Deve_retornar_texto_original_quando_string_nao_for_data', () => {
    it('deve retornar o texto original quando string não for uma data válida', () => {
      const resultado = formatDateForDisplay('not-a-date');
      expect(resultado).toBe('not-a-date');
    });
  });
});
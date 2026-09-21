import { formatCurrencyInput, parseCurrencyInput } from './currencyInput';

describe('currencyInput', () => {
  describe('formatCurrencyInput', () => {
    it('formata número como moeda pt-BR sem símbolo', () => {
      expect(formatCurrencyInput(5)).toBe('5,00');
      expect(formatCurrencyInput(5.5)).toBe('5,50');
      expect(formatCurrencyInput(1234.56)).toBe('1.234,56');
    });

    it('retorna vazio para valores inválidos', () => {
      expect(formatCurrencyInput('')).toBe('');
      expect(formatCurrencyInput(null)).toBe('');
      expect(formatCurrencyInput(undefined)).toBe('');
      expect(formatCurrencyInput(Number.NaN)).toBe('');
    });

    it('trata zero', () => {
      expect(formatCurrencyInput(0)).toBe('0,00');
    });
  });

  describe('parseCurrencyInput', () => {
    it('interpreta dígitos como centavos', () => {
      expect(parseCurrencyInput('5')).toBe(0.05);
      expect(parseCurrencyInput('550')).toBe(5.5);
      expect(parseCurrencyInput('5,50')).toBe(5.5);
      expect(parseCurrencyInput('R$ 1.234,56')).toBe(1234.56);
    });

    it('retorna vazio quando não há dígitos', () => {
      expect(parseCurrencyInput('')).toBe('');
      expect(parseCurrencyInput('R$')).toBe('');
      expect(parseCurrencyInput(null)).toBe('');
    });

    it('respeita limite de dígitos', () => {
      expect(parseCurrencyInput('123456789', { maxDigits: 8 })).toBe(123456.78);
    });
  });
});

import { cepDigits, formatCepInput, isValidCep } from './cepInput';

describe('cepInput', () => {
  describe('cepDigits', () => {
    it('extrai só dígitos e limita a 8', () => {
      expect(cepDigits('01310-100')).toBe('01310100');
      expect(cepDigits('01310100999')).toBe('01310100');
    });

    it('retorna vazio sem dígitos', () => {
      expect(cepDigits('')).toBe('');
      expect(cepDigits(null)).toBe('');
      expect(cepDigits('--')).toBe('');
    });
  });

  describe('formatCepInput', () => {
    it('formata progressivamente', () => {
      expect(formatCepInput('0')).toBe('0');
      expect(formatCepInput('01310')).toBe('01310');
      expect(formatCepInput('013101')).toBe('01310-1');
      expect(formatCepInput('01310100')).toBe('01310-100');
    });

    it('aceita valor já mascarado', () => {
      expect(formatCepInput('01310-100')).toBe('01310-100');
    });
  });

  describe('isValidCep', () => {
    it('aceita 8 dígitos', () => {
      expect(isValidCep('01310-100')).toBe(true);
      expect(isValidCep('01310100')).toBe(true);
    });

    it('rejeita incompleto', () => {
      expect(isValidCep('')).toBe(false);
      expect(isValidCep('01310-10')).toBe(false);
    });
  });
});

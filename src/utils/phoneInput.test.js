import { formatPhoneInput, isValidBrazilianPhone, phoneDigits } from './phoneInput';

describe('phoneInput', () => {
  describe('phoneDigits', () => {
    it('extrai só dígitos e limita a 11', () => {
      expect(phoneDigits('(11) 98888-8888')).toBe('11988888888');
      expect(phoneDigits('11 3333-3333')).toBe('1133333333');
      expect(phoneDigits('11988888888999')).toBe('11988888888');
    });

    it('retorna vazio sem dígitos', () => {
      expect(phoneDigits('')).toBe('');
      expect(phoneDigits(null)).toBe('');
      expect(phoneDigits('() -')).toBe('');
    });
  });

  describe('formatPhoneInput', () => {
    it('formata fixo com 10 dígitos', () => {
      expect(formatPhoneInput('1133333333')).toBe('(11) 3333-3333');
    });

    it('formata celular com 11 dígitos', () => {
      expect(formatPhoneInput('11988888888')).toBe('(11) 98888-8888');
    });

    it('formata progressivamente na digitação', () => {
      expect(formatPhoneInput('1')).toBe('(1');
      expect(formatPhoneInput('11')).toBe('(11');
      expect(formatPhoneInput('119')).toBe('(11) 9');
      expect(formatPhoneInput('119888')).toBe('(11) 9888');
      expect(formatPhoneInput('1198888')).toBe('(11) 9888-8');
      expect(formatPhoneInput('1198888888')).toBe('(11) 9888-8888');
      expect(formatPhoneInput('11988888888')).toBe('(11) 98888-8888');
    });

    it('aceita valor já mascarado', () => {
      expect(formatPhoneInput('(11) 98888-8888')).toBe('(11) 98888-8888');
    });
  });

  describe('isValidBrazilianPhone', () => {
    it('aceita 10 ou 11 dígitos', () => {
      expect(isValidBrazilianPhone('(11) 3333-3333')).toBe(true);
      expect(isValidBrazilianPhone('(11) 98888-8888')).toBe(true);
    });

    it('rejeita incompleto ou vazio', () => {
      expect(isValidBrazilianPhone('')).toBe(false);
      expect(isValidBrazilianPhone('(11) 9888-888')).toBe(false);
      expect(isValidBrazilianPhone('119')).toBe(false);
    });
  });
});

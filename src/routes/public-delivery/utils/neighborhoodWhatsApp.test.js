import {
  isValidStoreWhatsApp,
  neighborhoodRequestMessage,
  neighborhoodWhatsAppUrl,
} from './neighborhoodWhatsApp';

describe('neighborhood WhatsApp request', () => {
  it('monta a mensagem e codifica a URL', () => {
    const message = neighborhoodRequestMessage('Padaria Sol', 'Jardim Europa');
    expect(message).toBe(
      'Olá! Gostaria de fazer um pedido na Padaria Sol, mas não encontrei o bairro Jardim Europa na lista de entregas. Vocês entregam nesse bairro? Se sim, poderiam cadastrá-lo?'
    );
    const url = neighborhoodWhatsAppUrl('11988887777', 'Padaria Sol', 'Jardim Europa');
    expect(url.startsWith('https://wa.me/5511988887777?text=')).toBe(true);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(message);
    expect(url).not.toContain(' ');
  });

  it('não abre WhatsApp quando a loja não tem telefone válido', () => {
    expect(isValidStoreWhatsApp('')).toBe(false);
    expect(isValidStoreWhatsApp('123')).toBe(false);
    expect(neighborhoodWhatsAppUrl('123', 'Loja', 'Centro')).toBeNull();
  });
});

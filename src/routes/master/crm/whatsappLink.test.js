import { WEPER_WHATSAPP_MESSAGE, buildWhatsAppUrl, normalizeBrazilWhatsAppPhone } from './whatsappLink';

describe('normalizeBrazilWhatsAppPhone', () => {
  test('mantém um único DDI 55 e aceita máscara', () => {
    expect(normalizeBrazilWhatsAppPhone('5511999998888')).toBe('5511999998888');
    expect(normalizeBrazilWhatsAppPhone('11999998888')).toBe('5511999998888');
    expect(normalizeBrazilWhatsAppPhone('(11) 99999-8888')).toBe('5511999998888');
    expect(normalizeBrazilWhatsAppPhone('+55 (11) 98888-7777')).toBe('5511988887777');
  });

  test('rejeita nove dígitos, número inválido e ausente', () => {
    expect(normalizeBrazilWhatsAppPhone('999998888')).toBeNull();
    expect(normalizeBrazilWhatsAppPhone('123')).toBeNull();
    expect(normalizeBrazilWhatsAppPhone('+1 202 555 0123')).toBeNull();
    expect(normalizeBrazilWhatsAppPhone(null)).toBeNull();
    expect(normalizeBrazilWhatsAppPhone('')).toBeNull();
    expect(normalizeBrazilWhatsAppPhone('   ')).toBeNull();
  });
});

describe('buildWhatsAppUrl', () => {
  test('codifica a mensagem padrão com encodeURIComponent', () => {
    const url = buildWhatsAppUrl('(11) 99999-8888', WEPER_WHATSAPP_MESSAGE);
    expect(url.startsWith('https://wa.me/5511999998888?text=')).toBe(true);
    expect(url.includes(' ')).toBe(false);
    expect(url.includes('\n')).toBe(false);
    const encoded = url.slice(url.indexOf('?text=') + 6);
    expect(encoded).toBe(encodeURIComponent(WEPER_WHATSAPP_MESSAGE));
    expect(decodeURIComponent(encoded)).toBe(WEPER_WHATSAPP_MESSAGE);
    expect(WEPER_WHATSAPP_MESSAGE).toContain('💙');
    expect(WEPER_WHATSAPP_MESSAGE).toContain('• Delivery próprio sem comissões por pedido cobradas pela Weper.');
    expect(WEPER_WHATSAPP_MESSAGE.endsWith('www.weper.com.br')).toBe(true);
  });

  test('não monta URL sem telefone válido', () => {
    expect(buildWhatsAppUrl(null, WEPER_WHATSAPP_MESSAGE)).toBeNull();
    expect(buildWhatsAppUrl('999998888', WEPER_WHATSAPP_MESSAGE)).toBeNull();
  });
});

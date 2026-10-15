import axios from 'axios';
import { buildWhatsAppUrl, whatsAppDigits, openWhatsAppLead } from './whatsappTemplate';
jest.mock('axios');

test('normaliza DDD 55 e codifica mensagem sem disparar', () => {
  expect(whatsAppDigits('(55) 99999-8888')).toBe('5555999998888');
  expect(whatsAppDigits('+1 202 555 0123')).toBe('12025550123');
  expect(buildWhatsAppUrl('(11) 99999-8888', 'Olá & parceria?')).toBe('https://wa.me/5511999998888?text=Ol%C3%A1%20%26%20parceria%3F');
});
test('abrir solicita somente link e não confirma envio', async () => {
  const tab = { location: {}, close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(tab);
  axios.post.mockResolvedValue({ data: { url: 'https://wa.me/5511999998888?text=Oi' } });
  await openWhatsAppLead(9, true);
  expect(tab.opener).toBeNull();
  expect(tab.location.href).toContain('https://wa.me/');
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post.mock.calls[0][0]).toMatch(/\/leads\/9\/open$/);
  jest.restoreAllMocks(); axios.post.mockClear();
});
test('opt-out ou erro fecha aba sem navegar', async () => {
  const tab = { location: {}, close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(tab);
  axios.post.mockRejectedValue(new Error('Opt-out'));
  await expect(openWhatsAppLead(9, true)).rejects.toThrow('Opt-out');
  expect(tab.close).toHaveBeenCalled();
  expect(tab.location.href).toBeUndefined();
  jest.restoreAllMocks(); axios.post.mockClear();
});

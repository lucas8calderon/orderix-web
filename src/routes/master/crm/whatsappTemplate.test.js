import axios from 'axios';
import {
  buildWhatsAppUrl,
  whatsAppDigits,
  openWhatsAppLead,
  prepareWhatsAppOpen,
} from './whatsappTemplate';
jest.mock('axios');

test('normaliza DDD 55 e codifica mensagem sem disparar', () => {
  expect(whatsAppDigits('(55) 99999-8888')).toBe('5555999998888');
  expect(whatsAppDigits('+1 202 555 0123')).toBe('12025550123');
  expect(buildWhatsAppUrl('(11) 99999-8888', 'Olá & parceria?')).toBe('https://wa.me/5511999998888?text=Ol%C3%A1%20%26%20parceria%3F');
  expect(buildWhatsAppUrl('5511999998888', 'Olá 😄💙')).toBe(
    'https://wa.me/5511999998888?text=Ol%C3%A1%20%F0%9F%98%84%F0%9F%92%99',
  );
});

test('mensagem longa com emojis usa fallback sem text na URL', () => {
  const heavy = '🍔'.repeat(600);
  const result = prepareWhatsAppOpen('5511999998888', heavy);
  expect(result.url).toBe('https://wa.me/5511999998888');
  expect(result.copyMessage).toBe(true);
  expect(result.message).toBe(heavy);
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

test('abrir com mensagem longa copia texto e avisa', async () => {
  const tab = { location: {}, close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(tab);
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  axios.post.mockResolvedValue({
    data: {
      url: 'https://wa.me/5511999998888',
      copyMessage: true,
      message: 'texto longo',
      notice: 'Cole no WhatsApp.',
    },
  });
  await openWhatsAppLead(3, true);
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('texto longo');
  expect(window.alert).toHaveBeenCalledWith('Cole no WhatsApp.');
  expect(tab.location.href).toBe('https://wa.me/5511999998888');
  jest.restoreAllMocks();
  axios.post.mockClear();
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

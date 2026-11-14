import { thermalEnabled } from './thermalPrint';
import { openRouteSheetPrint, routeSheetHtml } from './routeSheetPrint';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(async () => 'data:image/png;base64,abc'),
}));

const sheet = {
  storeName: 'Weper Burger',
  routeLabel: '0050',
  stopCount: 2,
  originAddress: 'Rua da Loja, 10',
  courierName: 'João',
  publicUrl: 'https://www.weper.com.br/rotas/abc',
  pin: '123456',
  qrDataUrl: 'data:image/png;base64,abc',
  stops: [
    {
      sequence: 1,
      orderLabel: '0040',
      address: 'Rua das Flores, 100 — Centro — São Paulo/SP',
      neighborhood: 'Centro',
      complement: 'Apto 2',
    },
    {
      sequence: 2,
      orderLabel: '0041',
      address: 'Avenida Brasil com nome bem longo para quebrar na bobina de 80 mm, 2500',
      complement: '',
    },
  ],
};

function installIframePrint() {
  const probe = document.createElement('iframe');
  document.body.appendChild(probe);
  const win = probe.contentWindow;
  if (win) {
    Object.getPrototypeOf(win).print = function print() {};
  }
  probe.remove();
}

beforeAll(() => { installIframePrint(); });
afterEach(() => {
  document.querySelectorAll('iframe').forEach((frame) => frame.remove());
});

test('comprovante da rota lista as paradas e o QR sem distância', () => {
  const html = routeSheetHtml(sheet);
  expect(html).toContain('WEPER');
  expect(html).toContain('ROTA DE ENTREGAS');
  expect(html).toContain('Pedido 0040');
  expect(html).toContain('Rua das Flores, 100 — Centro — São Paulo/SP');
  expect(html).toContain('Apto 2');
  expect(html).toContain('Avenida Brasil com nome bem longo');
  expect(html).toContain('data:image/png;base64,abc');
  expect(html).toContain('PIN 123456');
  expect(html).toContain('overflow-wrap: anywhere');
  expect(html).toContain('width: 80mm');
  expect(html).not.toMatch(/distância|km|minutos/i);
});

test('impressão da rota não depende da flag térmica', async () => {
  expect(thermalEnabled()).toBe(false);
  await expect(openRouteSheetPrint(sheet)).resolves.toEqual({ state: 'print_requested' });
  const frame = document.querySelector('iframe');
  expect(frame?.contentDocument?.body?.innerHTML || '').toContain('Pedido 0040');
  expect(frame?.contentDocument?.body?.innerHTML || '').toContain('data:image/png;base64,abc');
});

import { diagnosticReport, loadDeliveryReceiptOptions, openThermalPrint, receiptHtml, TEST_ACCOUNT, thermalEnabled } from './thermalPrint';
import { saveSession, clearSession } from '../services/session';
import { ensureDeliveryReceiptRoute } from '../services/deliveryRouteApi';

jest.mock('../services/deliveryRouteApi', () => ({
  ensureDeliveryReceiptRoute: jest.fn(),
  apiErrorMessage: (error, fallback) => error?.response?.data?.message || fallback,
}));

jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn(async () => 'data:image/png;base64,QUJD') },
}));

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
  clearSession();
  jest.restoreAllMocks();
  delete process.env.REACT_APP_THERMAL_PRINT_SCOPE;
  document.querySelectorAll('iframe').forEach((frame) => frame.remove());
});
test('flag desativada, loja permitida e liberação global exigem contexto da loja', () => {
  expect(thermalEnabled({ storeId: 1 }, '')).toBe(false);
  expect(thermalEnabled({ storeId: 1 }, '11')).toBe(false);
  expect(thermalEnabled({ storeId: 1 }, '1, 2')).toBe(true);
  expect(thermalEnabled({ storeId: 9 }, 'all')).toBe(true);
  expect(thermalEnabled({ storeId: 9 }, ' ALL ')).toBe(true);
  expect(thermalEnabled({ storeId: 4 }, ' 4 , 8 ')).toBe(true);
  expect(thermalEnabled({ storeId: 4 }, 'almost')).toBe(false);
  expect(thermalEnabled(null, 'all')).toBe(false);
  expect(thermalEnabled({ storeId: '' }, 'all')).toBe(false);
});
test('cupom escapa dados, mantém acentos, quantidades e adicionais', () => {
  const account = JSON.parse(JSON.stringify(TEST_ACCOUNT));
  account.orders[0].products[0].observation = '<img src=x onerror=alert(1)> ação';
  const html = receiptHtml(account, { test: true, placeLabel: '<mesa>' });
  expect(html).toContain('&lt;img');
  expect(html).toContain('&lt;mesa&gt;');
  expect(html).not.toContain('<img');
  expect(html).not.toContain('<mesa>');
  expect(html).toContain('ação');
  expect(html).toContain('2x');
  expect(html).toContain('Bacon');
  expect(html).toContain('57,00');
  expect(html).toContain('width: 80mm');
  expect(html).toContain('@page { margin: 0; }');
  expect(html).not.toContain('size: 80mm auto');
  expect(html).not.toContain('NÃO É DOCUMENTO FISCAL');
  expect(html).not.toContain('NÃO É COMPROVANTE DE PAGAMENTO');
  expect(html).not.toContain('WEPER');
  expect(html).not.toMatch(/cupom fiscal|recibo|quitad/i);
  expect(() => receiptHtml({ orders: [] })).toThrow();
});
test('comanda espelha a tela: nome longo, acentos, adicionais, observação e código', () => {
  const html = receiptHtml({
    orders: [{
      id: 41,
      displayCode: '0041',
      customerName: 'João',
      status: 'CANCELLED',
      cancelReason: 'Cliente desistiu',
      paymentMethod: 'PIX',
      deliveryFee: 12.34,
      discount: 5,
      totalAmount: 99,
      observation: 'Sem pressa',
      products: [{
        name: 'Pão de queijo com nome extremamente longo para a bobina de 80 mm',
        quantity: 2,
        value: 8,
        observation: 'Bem assado, açúcar à parte',
        extras: [{ name: 'Requeijão', quantity: 2, price: 1.5 }],
        mandatoryGroups: [{ id: 7, name: 'Tamanho', items: [{ id: 3, name: 'Médio', price: 2 }] }],
        mandatorySelections: [{ mandatoryGroupId: 7, selectedItemId: 3 }],
      }, {
        name: 'Água com gás',
        quantity: 1.5,
        value: 4,
      }],
    }],
  }, { placeLabel: 'Mesa 12' });
  expect(html).toContain('Pedido #0041 · João');
  expect(html).not.toContain('Pedido #41 ');
  expect(html).not.toContain('Código 0041');
  expect(html).toContain('Mesa 12');
  expect(html).toContain('Pão de queijo com nome extremamente longo para a bobina de 80 mm');
  expect(html).toContain('2x');
  expect(html).toContain('1,5x Água com gás');
  expect(html).toContain('Tamanho: Médio');
  expect(html).toContain('Extra: 2x Requeijão');
  expect(html).toContain('açúcar');
  expect(html).toContain('Obs.:');
  expect(html).toContain('Observação do pedido:');
  expect(html).toContain('Sem pressa');
  expect(html).toContain('Cancelado: Cliente desistiu');
  expect(html).toContain('26,00');
  expect(html).toContain('TOTAL');
  expect(html).toContain('99,00');
  expect(html).not.toContain('PIX');
  expect(html).not.toContain('Pago');
  expect(html).not.toContain('A receber');
  expect(html).not.toContain('12,34');
  expect(html).not.toContain('WEPER');
  expect(html).not.toContain('NÃO É DOCUMENTO FISCAL');
  expect(html).toContain('overflow-wrap: anywhere');
});
test('dois itens do mesmo produto não compartilham adicional nem observação', () => {
  const html = receiptHtml({
    orders: [{
      id: 147,
      customerName: 'Balcão',
      orderSource: 'COUNTER',
      totalAmount: 55,
      products: [{
        id: 9,
        name: 'Dog Maluco',
        quantity: 1,
        value: 26,
        observation: 'com ovo',
        mandatoryGroups: [{ id: 1, name: 'Adicionais', items: [{ id: 4, name: 'Ovo', price: 3 }] }],
        mandatorySelections: [{ mandatoryGroupId: 1, selectedItemId: 4 }],
      }, {
        id: 9,
        name: 'Dog Maluco',
        quantity: 1,
        value: 26,
        observation: 'sem ovo',
        mandatoryGroups: [{ id: 1, name: 'Adicionais', items: [{ id: 4, name: 'Ovo', price: 3 }] }],
        mandatorySelections: [],
      }],
    }],
  }, { placeLabel: 'Pedido 147' });
  expect(html).toContain('Pedido #147 · Balcão');
  expect(html).not.toMatch(/>\s*Pedido 147\s*</);
  expect(html.split('Adicionais: Ovo').length - 1).toBe(1);
  expect(html).toContain('Obs.:');
  expect(html).toContain('com ovo');
  expect(html).toContain('sem ovo');
  expect(html).not.toContain('RETIRADA NA LOJA');
  expect(html).toContain('TOTAL');
  expect(html).toContain('55,00');
  expect(html).not.toContain('WEPER');
});
test('entrega mostra endereço, complemento e referência; retirada não inventa endereço', () => {
  const qr = 'data:image/png;base64,QUJD';
  const delivery = receiptHtml({
    orders: [{
      id: 158,
      displayCode: '0158',
      customerName: 'João Silva',
      customerPhone: '11999998888',
      deliveryFulfillment: 'DELIVERY',
      orderSource: 'DELIVERY',
      createdAt: '2026-11-14T20:35:00',
      deliveryStreet: 'Rua das Flores',
      deliveryNumber: '120',
      deliveryNeighborhood: 'Centro',
      deliveryCity: 'São Paulo',
      deliveryState: 'SP',
      deliveryComplement: 'Casa 2',
      deliveryReference: 'portão azul',
      deliveryFee: 5,
      totalAmount: 55,
      products: [{ name: 'X-Burger', quantity: 2, value: 25 }],
    }],
  }, {
    storeName: 'Weper Burger',
    routeQrByOrderId: { 158: qr },
  });
  expect(delivery).toContain('WEPER BURGER');
  expect(delivery).toContain('PEDIDO #0158');
  expect(delivery).toContain('14/11/2026 - 20:35');
  expect(delivery).toContain('ENTREGA');
  expect(delivery).toContain('Cliente: João Silva');
  expect(delivery).toContain('Rua das Flores, 120');
  expect(delivery).toContain('Centro - São Paulo/SP');
  expect(delivery).toContain('Compl.: Casa 2');
  expect(delivery).toContain('Ref.: portão azul');
  expect(delivery).toContain('2x X-Burger');
  expect(delivery).toContain('Taxa entrega');
  expect(delivery).toContain('5,00');
  expect(delivery).toContain('TOTAL');
  expect(delivery).toContain('55,00');
  expect(delivery).toContain('ROTA DE ENTREGA');
  expect(delivery).toContain('Escaneie para abrir a rota');
  expect(delivery).toContain(`src="${qr}"`);
  expect(delivery).toContain('class="qr"');
  expect(delivery).toContain('margin: 4mm auto');
  expect(delivery).not.toContain('[QR CODE]');
  expect(delivery).not.toContain('11999998888');
  expect(delivery).not.toContain('RETIRADA NA LOJA');
  expect(delivery).not.toContain('COMANDA');
  expect(delivery).not.toContain('Fim da comanda');
  expect(delivery).toContain('width: 80mm');
  expect(delivery).toContain('@page { margin: 0; }');

  const missingDetails = receiptHtml({
    orders: [{
      id: 21,
      customerName: 'Ana',
      deliveryFulfillment: 'DELIVERY',
      deliveryStreet: 'Rua das Flores',
      deliveryNumber: '100',
      deliveryComplement: '  ',
      deliveryReference: null,
      products: [{ name: 'Suco', quantity: 1, value: 10 }],
    }],
  });
  expect(missingDetails).toContain('Rua das Flores, 100');
  expect(missingDetails).toContain('ENTREGA');
  expect(missingDetails).not.toContain('Compl.:');
  expect(missingDetails).not.toContain('Ref.:');
  expect(missingDetails).not.toContain('null');

  const pickup = receiptHtml({
    orders: [{
      id: 22,
      customerName: 'Ana',
      deliveryFulfillment: 'PICKUP',
      orderSource: 'PICKUP',
      deliveryStreet: 'Rua que não deve sair',
      deliveryComplement: 'apto 9',
      deliveryReference: 'portão',
      products: [{ name: 'Suco', quantity: 1, value: 10 }],
    }],
  });
  expect(pickup).toContain('RETIRADA NA LOJA');
  expect(pickup).toContain('O pedido será retirado na loja.');
  expect(pickup).not.toContain('Rua que não deve sair');
  expect(pickup).not.toContain('Complemento:');
  expect(pickup).not.toContain('apto 9');
});

function deliveryPrintOrder(extra) {
  return {
    id: 158,
    displayCode: '0158',
    customerName: 'João Silva',
    deliveryFulfillment: 'DELIVERY',
    orderSource: 'DELIVERY',
    deliveryStreet: 'Rua das Flores',
    deliveryNumber: '120',
    totalAmount: 55,
    products: [{ name: 'X-Burger', quantity: 1, value: 50 }],
    ...extra,
  };
}

function paymentComesAfterTotal(html, label) {
  const totalAt = html.indexOf('TOTAL');
  const payAt = html.indexOf(label);
  expect(totalAt).toBeGreaterThanOrEqual(0);
  expect(payAt).toBeGreaterThan(totalAt);
  return payAt;
}

test('comanda de entrega mostra pago com Pix, a receber e a forma', () => {
  const paid = receiptHtml({
    orders: [deliveryPrintOrder({
      paymentStatus: 'PAID',
      paymentMethod: 'PIX',
      onlinePayment: true,
    })],
  });
  paymentComesAfterTotal(paid, 'Pago · Pix');
  expect(paid.indexOf('Pago · Pix')).toBeLessThan(paid.indexOf('ROTA DE ENTREGA'));
  expect(paid).not.toContain('A receber');
  expect(paid).not.toContain('Dinheiro');

  const cash = receiptHtml({
    orders: [deliveryPrintOrder({
      paymentStatus: null,
      paymentMethod: 'CASH',
      onlinePayment: false,
    })],
  });
  paymentComesAfterTotal(cash, 'A receber na entrega');
  expect(cash.indexOf('A receber na entrega')).toBeLessThan(cash.indexOf('ROTA DE ENTREGA'));
  expect(cash).toContain('Dinheiro');
  expect(cash).not.toContain('Pago');

  const pickup = receiptHtml({
    orders: [{
      id: 22,
      customerName: 'Ana',
      deliveryFulfillment: 'PICKUP',
      orderSource: 'PICKUP',
      paymentMethod: 'DEBIT',
      onlinePayment: false,
      products: [{ name: 'Suco', quantity: 1, value: 10 }],
    }],
  });
  paymentComesAfterTotal(pickup, 'A receber na retirada');
  expect(pickup).toContain('Cartão de débito');
  expect(pickup).toContain('COMANDA');
  expect(pickup).not.toContain('ROTA DE ENTREGA');
  expect(pickup).not.toContain('Pago');
  expect(pickup).not.toContain('A receber na entrega');

  const noMethod = receiptHtml({
    orders: [deliveryPrintOrder({
      paymentMethod: null,
      onlinePayment: false,
    })],
  });
  paymentComesAfterTotal(noMethod, 'A receber na entrega');
  expect(noMethod).not.toContain('Pix');
  expect(noMethod).not.toContain('Dinheiro');
  expect(noMethod).not.toContain('Cartão');
  expect(noMethod).not.toContain('Pago');

  const paidWithoutMethod = receiptHtml({
    orders: [deliveryPrintOrder({
      paymentStatus: 'APPROVED',
      paymentMethod: '',
      onlinePayment: true,
    })],
  });
  expect(paidWithoutMethod).toContain('>Pago<');
  expect(paidWithoutMethod).not.toContain('Pago ·');
  expect(paidWithoutMethod).not.toContain('Pix');

  const onlinePending = receiptHtml({
    orders: [deliveryPrintOrder({
      paymentMethod: 'PIX',
      onlinePayment: true,
    })],
  });
  expect(onlinePending).toContain('Não pago');
  expect(onlinePending).toContain('Pix');
  expect(onlinePending).not.toContain('A receber na entrega');
  expect(onlinePending).not.toContain('Pago ·');
});
test('o QR da entrega recebe só a URL e a comanda não repete o link', async () => {
  const QRCode = (await import('qrcode')).default;
  ensureDeliveryReceiptRoute.mockResolvedValue({
    data: {
      publicUrl: 'https://www.weper.com.br/rotas/abc',
      storeName: 'Weper Burger',
    },
  });
  const account = {
    orders: [{
      id: 158,
      displayCode: '0158',
      customerName: 'João',
      customerPhone: '11988887777',
      deliveryFulfillment: 'DELIVERY',
      deliveryStreet: 'Rua das Flores',
      deliveryNumber: '120',
      products: [{ name: 'X-Burger', quantity: 1, value: 10 }],
    }],
  };
  const options = await loadDeliveryReceiptOptions(account);
  expect(ensureDeliveryReceiptRoute).toHaveBeenCalledWith(158);
  expect(QRCode.toDataURL).toHaveBeenCalledWith(
    'https://www.weper.com.br/rotas/abc',
    expect.objectContaining({ margin: 2, width: 280 }),
  );
  const html = receiptHtml(account, options);
  expect(html).toContain('src="data:image/png;base64,QUJD"');
  expect(html).not.toContain('https://www.weper.com.br/rotas/abc');
  expect(html).not.toContain('11988887777');

  ensureDeliveryReceiptRoute.mockResolvedValue({
    data: { publicUrl: 'https://www.weper.com.br/rotas/abc?telefone=11988887777' },
  });
  await expect(loadDeliveryReceiptOptions(account)).rejects.toThrow('QR');
});
test('entrega sem QR não abre a impressão; balcão continua sem a rota', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const delivery = {
    orders: [{
      id: 9,
      deliveryFulfillment: 'DELIVERY',
      products: [{ name: 'X-Burger', quantity: 1, value: 10 }],
    }],
  };
  expect(() => openThermalPrint(delivery)).toThrow('QR');
  const counter = openThermalPrint(TEST_ACCOUNT);
  expect(counter.state).toBe('print_requested');
  const html = document.querySelector('iframe').contentDocument.documentElement.innerHTML;
  expect(html).toContain('COMANDA');
  expect(html).not.toContain('ROTA DE ENTREGA');
  expect(html).not.toContain('<img');
});
test('flag impede a impressão e o clique não abre aba', () => {
  const open = jest.spyOn(window, 'open');
  expect(() => openThermalPrint(TEST_ACCOUNT)).toThrow('desativada');
  expect(open).not.toHaveBeenCalled();
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const attempt = openThermalPrint(TEST_ACCOUNT);
  expect(open).not.toHaveBeenCalled();
  expect(attempt.state).toBe('print_requested');
  const frame = document.querySelector('iframe');
  expect(frame.dataset.printed).toBe('1');
  expect(frame.contentDocument.documentElement.innerHTML).toContain('COMANDA');
  expect(frame.contentDocument.documentElement.innerHTML).not.toContain('WEPER');
});
test('solicitação não confirma impressão física', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const open = jest.spyOn(window, 'open');
  const attempt = openThermalPrint(TEST_ACCOUNT);
  expect(open).not.toHaveBeenCalled();
  expect(attempt.state).toBe('print_requested');
  const report = diagnosticReport({ result: 'Cancelei a impressão', attempt });
  expect(report).toContain('"physicalPrintVerified": false');
  expect(report).toContain('Cancelei a impressão');
  expect(report).not.toContain('Cliente de teste');
  expect(report).not.toContain('weper.token');
});
test('falha ao escrever a comanda não confirma impressão', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const append = document.body.appendChild.bind(document.body);
  jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
    const added = append(node);
    if (node.tagName === 'IFRAME' && node.contentDocument) {
      node.contentDocument.write = () => { throw new Error('bloqueado'); };
    }
    return added;
  });
  expect(() => openThermalPrint(TEST_ACCOUNT)).toThrow('Não foi possível preparar');
  expect(document.querySelector('iframe')).toBeNull();
});
test('falha no print não confirma impressão', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const append = document.body.appendChild.bind(document.body);
  jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
    const added = append(node);
    if (node.tagName === 'IFRAME' && node.contentWindow) {
      node.contentWindow.print = () => { throw new Error('bloqueado'); };
    }
    return added;
  });
  expect(() => openThermalPrint(TEST_ACCOUNT)).toThrow('Não foi possível enviar');
  expect(document.querySelector('iframe')).toBeNull();
});

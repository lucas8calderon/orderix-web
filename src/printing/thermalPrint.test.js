import { diagnosticReport, openThermalPrint, receiptHtml, TEST_ACCOUNT, thermalEnabled } from './thermalPrint';
import { saveSession, clearSession } from '../services/session';

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
  expect(html).toContain('Pedido #41 · João');
  expect(html).toContain('Código 0041');
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
  const delivery = receiptHtml({
    orders: [{
      id: 20,
      customerName: 'Ana',
      deliveryFulfillment: 'DELIVERY',
      orderSource: 'DELIVERY',
      deliveryStreet: 'Rua das Flores',
      deliveryNumber: '100',
      deliveryNeighborhood: 'Centro',
      deliveryCity: 'Campinas',
      deliveryState: 'SP',
      deliveryComplement: 'apto 12',
      deliveryReference: 'portão azul',
      totalAmount: 40,
      products: [{ name: 'Suco', quantity: 1, value: 40 }],
    }],
  });
  expect(delivery).toContain('Entrega: Rua das Flores, 100 · Centro · Campinas/SP');
  expect(delivery).toContain('Complemento: apto 12');
  expect(delivery).toContain('Referência: portão azul');
  expect(delivery).not.toContain('RETIRADA NA LOJA');

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
  expect(missingDetails).toContain('Entrega: Rua das Flores, 100');
  expect(missingDetails).not.toContain('Complemento:');
  expect(missingDetails).not.toContain('Referência:');
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

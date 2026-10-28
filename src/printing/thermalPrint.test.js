import { diagnosticReport, openThermalPrint, receiptHtml, TEST_ACCOUNT, thermalEnabled } from './thermalPrint';
import { saveSession, clearSession } from '../services/session';

afterEach(() => { clearSession(); jest.restoreAllMocks(); delete process.env.REACT_APP_THERMAL_PRINT_SCOPE; });
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
  expect(html).toContain('NÃO É DOCUMENTO FISCAL');
  expect(html).toContain('NÃO É COMPROVANTE DE PAGAMENTO');
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
  expect(html).not.toContain('PIX');
  expect(html).not.toContain('12,34');
  expect(html).not.toContain('99,00');
  expect(html).toContain('overflow-wrap: anywhere');
});
test('flag impede abertura e bloqueio de popup gera orientação', () => {
  const open = jest.spyOn(window, 'open').mockReturnValue(null);
  expect(() => openThermalPrint(TEST_ACCOUNT)).toThrow('desativada');
  expect(open).not.toHaveBeenCalled();
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  expect(() => openThermalPrint(TEST_ACCOUNT)).toThrow('pop-ups');
});
test('solicitação e retorno da janela não confirmam impressão física', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const doc = document.implementation.createHTMLDocument();
  const popup = { document: doc, focus: jest.fn(), print: jest.fn(), close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(popup);
  const attempt = openThermalPrint(TEST_ACCOUNT);
  expect(popup.print).toHaveBeenCalledTimes(1);
  expect(popup.close).not.toHaveBeenCalled();
  expect(attempt.state).toBe('print_requested');
  const report = diagnosticReport({ result: 'Cancelei a impressão', attempt });
  expect(report).toContain('"physicalPrintVerified": false');
  expect(report).toContain('Cancelei a impressão');
  expect(report).not.toContain('Cliente de teste');
  expect(report).not.toContain('weper.token');
});
test('falha ao escrever a janela não confirma impressão', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const popup = {
    document: {
      open: jest.fn(),
      write: jest.fn(() => { throw new Error('bloqueado'); }),
      close: jest.fn(),
    },
    focus: jest.fn(),
    print: jest.fn(),
    close: jest.fn(),
  };
  jest.spyOn(window, 'open').mockReturnValue(popup);
  expect(() => openThermalPrint(TEST_ACCOUNT)).toThrow('Não foi possível abrir');
  expect(popup.print).not.toHaveBeenCalled();
  expect(popup.close).toHaveBeenCalled();
});
test('impedir opener não cancela o pedido de impressão', () => {
  saveSession('test', { storeId: 1 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const doc = document.implementation.createHTMLDocument();
  const popup = { document: doc, focus: jest.fn(), print: jest.fn(), close: jest.fn() };
  Object.defineProperty(popup, 'opener', { set() { throw new Error('somente leitura'); } });
  jest.spyOn(window, 'open').mockReturnValue(popup);
  expect(openThermalPrint(TEST_ACCOUNT).state).toBe('print_requested');
  expect(popup.print).toHaveBeenCalledTimes(1);
  expect(popup.close).not.toHaveBeenCalled();
});

import { attemptKey, leadIsReady, maskWhatsApp, validateName, validateWhatsApp } from './subscriptionLead';

test('masks a brazilian mobile and rejects incomplete numbers', () => {
  expect(maskWhatsApp('11988887777')).toBe('(11) 98888-7777');
  expect(maskWhatsApp('+55 11 98888-7777')).toBe('(11) 98888-7777');
  expect(validateWhatsApp('(11) 98888-7777')).toBe('');
  expect(validateWhatsApp('(11) 3333-4444')).toMatch(/WhatsApp/);
  expect(validateName('  Ana   Souza ')).toBe('');
  expect(validateName('A')).toMatch(/nome/);
  expect(leadIsReady('Ana Souza', '(11) 98888-7777')).toBe(true);
  expect(leadIsReady('Ana', '(11) 3333-4444')).toBe(false);
});

test('reuses the same attempt key for a double click', () => {
  window.sessionStorage.clear();
  expect(attemptKey('home:PLAN_01')).toBe(attemptKey('home:PLAN_01'));
  expect(attemptKey('home:PLAN_02')).not.toBe(attemptKey('home:PLAN_01'));
});

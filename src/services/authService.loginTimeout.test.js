import { resolveLoginTimeoutMs } from './authService';

test('o login de homologação espera a API gratuita acordar', () => {
  expect(resolveLoginTimeoutMs('https://weper-staging-api.onrender.com')).toBe(120000);
});

test('o login dos outros ambientes mantém o timeout de 15 segundos', () => {
  expect(resolveLoginTimeoutMs('https://api.weper.com.br')).toBe(15000);
  expect(resolveLoginTimeoutMs('https://weper-production-api.onrender.com')).toBe(15000);
  expect(resolveLoginTimeoutMs('http://localhost:8080')).toBe(15000);
});

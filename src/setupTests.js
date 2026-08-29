// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { TextDecoder, TextEncoder } from 'util';
import '@testing-library/jest-dom';

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

jest.mock('axios', () => {
  const interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    defaults: {},
    interceptors,
  };
  return {
    __esModule: true,
    default: instance,
    get: instance.get,
    post: instance.post,
    put: instance.put,
    delete: instance.delete,
    interceptors,
  };
});

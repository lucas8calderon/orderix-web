import { toApiPayload, toUiEmployee } from './employeesService';

describe('employeesService', () => {
  it('não expõe adquirente do colaborador', () => {
    const mapped = toUiEmployee({
      id: 1,
      name: 'Lucas',
      email: 'lucas@gmail.com',
      role: 'WAITER',
      chargeProvider: 'GETNET',
      canCharge: false,
    });
    expect(mapped.chargeProvider).toBeNull();
    expect(mapped.canCharge).toBe(true);
    expect(mapped.profile).toBe('GARCOM');
  });

  it('não envia chargeProvider no create/edit', () => {
    expect(toApiPayload({
      name: 'Lucas',
      email: 'lucas@gmail.com',
      profile: 'GARCOM',
      chargeProvider: 'GETNET',
    })).toEqual({
      name: 'Lucas',
      email: 'lucas@gmail.com',
      role: 'WAITER',
    });
  });
});

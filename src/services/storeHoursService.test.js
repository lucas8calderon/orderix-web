import {
  createDefaultSchedule,
  formatDayHours,
  formatTodayHours,
  isStoreOpenNow,
  toHoursPayload,
  toHoursUi,
} from './storeHoursService';

describe('storeHoursService', () => {
  it('normaliza payload de horário com schedule', () => {
    const schedule = createDefaultSchedule().map((day) => ({
      ...day,
      enabled: day.weekday === 1 || day.weekday === 7,
      intervals: day.weekday === 1 || day.weekday === 7
        ? [{ open: '09:00', close: '18:00' }]
        : [],
    }));
    expect(toHoursPayload({
      schedule,
      deliveryEnabled: true,
    })).toEqual({
      schedule: expect.arrayContaining([
        expect.objectContaining({
          weekday: 1,
          enabled: true,
          intervals: [{ open: '09:00', close: '18:00' }],
        }),
        expect.objectContaining({ weekday: 2, enabled: false, intervals: [] }),
      ]),
      deliveryEnabled: true,
    });
  });

  it('preenche defaults no UI', () => {
    const ui = toHoursUi({});
    expect(ui.schedule).toHaveLength(7);
    expect(ui.schedule.every((day) => day.enabled)).toBe(true);
    expect(ui.schedule[0].intervals[0]).toEqual({ open: '08:00', close: '22:00' });
    expect(ui.deliveryEnabled).toBe(false);
  });

  it('converte legado opening/closing/weekdays para schedule', () => {
    const ui = toHoursUi({
      openingTime: '09:00:00',
      closingTime: '18:30:59',
      openWeekdays: [1, 7],
      deliveryEnabled: false,
    });
    expect(ui.schedule[0].enabled).toBe(true);
    expect(ui.schedule[0].intervals[0]).toEqual({ open: '09:00', close: '18:30' });
    expect(ui.schedule[1].enabled).toBe(false);
    expect(ui.schedule[6].enabled).toBe(true);
  });

  it('formata múltiplos intervalos no padrão da UI', () => {
    expect(formatDayHours({
      enabled: true,
      intervals: [
        { open: '00:00', close: '03:00' },
        { open: '09:00', close: '23:59' },
      ],
    })).toBe('00:00 às 03:00 - 09:00 às 23:59');
    expect(formatDayHours({ enabled: false, intervals: [] })).toBe('Fechado');
  });

  it('considera aberto no meio da janela de dia útil', () => {
    const mondayNoon = new Date('2026-09-21T15:00:00.000Z');
    expect(isStoreOpenNow({
      schedule: createDefaultSchedule().map((day) => ({
        ...day,
        enabled: [1, 2, 3, 4, 5].includes(day.weekday),
        intervals: [1, 2, 3, 4, 5].includes(day.weekday)
          ? [{ open: '08:00', close: '22:00' }]
          : [],
      })),
      now: mondayNoon,
    })).toBe(true);
  });

  it('suporta múltiplos intervalos e overnight', () => {
    const schedule = createDefaultSchedule().map((day) => ({
      weekday: day.weekday,
      enabled: day.weekday === 2,
      intervals: day.weekday === 2
        ? [
          { open: '00:00', close: '03:00' },
          { open: '22:00', close: '02:00' },
        ]
        : [],
    }));

    expect(isStoreOpenNow({
      schedule,
      now: new Date('2026-09-23T02:30:00.000Z'), // Tue 23:30 BRT
    })).toBe(true);

    expect(isStoreOpenNow({
      schedule,
      now: new Date('2026-09-23T04:15:00.000Z'), // Wed 01:15 BRT (overnight)
    })).toBe(true);

    expect(isStoreOpenNow({
      schedule,
      now: new Date('2026-09-22T20:00:00.000Z'), // Mon 17:00 BRT
    })).toBe(false);
  });

  it('formata o horário de hoje no weekday ISO e no fuso local', () => {
    const schedule = [
      {
        weekday: 3,
        enabled: true,
        intervals: [
          { open: '11:00', close: '14:00' },
          { open: '18:00', close: '23:00' },
        ],
      },
      { weekday: 7, enabled: false, intervals: [] },
    ];

    expect(formatTodayHours(schedule, new Date(2026, 8, 23, 15, 0, 0))).toEqual({
      label: 'Hoje',
      value: '11:00–14:00, 18:00–23:00',
    });
    expect(formatTodayHours(schedule, new Date(2026, 9, 4, 12, 0, 0))).toEqual({
      label: 'Hoje',
      value: 'Não abre hoje',
    });
    expect(formatTodayHours(schedule, new Date(2026, 8, 21, 12, 0, 0)).value).toBe('Não abre hoje');
    expect(formatTodayHours([], new Date(2026, 8, 23, 15, 0, 0))).toBeNull();
    expect(formatTodayHours(null)).toBeNull();
  });

  it('considera fechado fora do horário ou em dia desativado', () => {
    const schedule = createDefaultSchedule().map((day) => ({
      ...day,
      enabled: [1, 2, 3, 4, 5].includes(day.weekday),
      intervals: [1, 2, 3, 4, 5].includes(day.weekday)
        ? [{ open: '08:00', close: '22:00' }]
        : [],
    }));

    expect(isStoreOpenNow({
      schedule,
      now: new Date('2026-09-22T02:30:00.000Z'),
    })).toBe(false);

    expect(isStoreOpenNow({
      schedule,
      now: new Date('2026-09-20T15:00:00.000Z'),
    })).toBe(false);
  });
});

import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const STORE_HOURS_TIMEZONE = 'America/Sao_Paulo';

/** Ordem visual Dom→Sáb; ids ISO (1=segunda … 7=domingo). */
export const WEEKDAY_OPTIONS = [
  { id: 7, label: 'Domingo' },
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
];

const STORE_HOURS_URL = `${API_BASE_URL}/stores/me/hours`;
const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '22:00';

export function getStoreHours() {
  return axios.get(STORE_HOURS_URL);
}

export function updateStoreHours(payload) {
  return axios.put(STORE_HOURS_URL, payload);
}

export function normalizeTime(value, fallback = DEFAULT_OPEN) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(String(value || '').trim());
  return match ? `${match[1]}:${match[2]}` : fallback;
}

export function createDefaultSchedule() {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    enabled: true,
    intervals: [{ open: DEFAULT_OPEN, close: DEFAULT_CLOSE }],
  }));
}

export function normalizeSchedule(raw) {
  const byDay = new Map(
    [1, 2, 3, 4, 5, 6, 7].map((weekday) => [
      weekday,
      { weekday, enabled: false, intervals: [] },
    ])
  );

  if (Array.isArray(raw)) {
    raw.forEach((day) => {
      const weekday = Number(day?.weekday);
      if (!byDay.has(weekday)) return;
      const intervals = (Array.isArray(day?.intervals) ? day.intervals : [])
        .map((interval) => ({
          open: normalizeTime(interval?.open, DEFAULT_OPEN),
          close: normalizeTime(interval?.close, DEFAULT_CLOSE),
        }))
        .filter((interval) => interval.open && interval.close);
      const enabled = Boolean(day?.enabled) && intervals.length > 0;
      byDay.set(weekday, {
        weekday,
        enabled,
        intervals: enabled ? intervals : [],
      });
    });
  }

  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => byDay.get(weekday));
}

/** Converte payload legado (opening/closing/weekdays) se a API ainda não mandar schedule. */
export function scheduleFromLegacy(data = {}) {
  const weekdays = Array.isArray(data.openWeekdays)
    ? data.openWeekdays.map(Number).filter((day) => day >= 1 && day <= 7)
    : [1, 2, 3, 4, 5, 6, 7];
  const open = normalizeTime(data.openingTime, DEFAULT_OPEN);
  const close = normalizeTime(data.closingTime, DEFAULT_CLOSE);
  const active = new Set(weekdays);
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
    const enabled = active.has(weekday);
    return {
      weekday,
      enabled,
      intervals: enabled ? [{ open, close }] : [],
    };
  });
}

export function toHoursUi(data = {}) {
  const schedule = Array.isArray(data.schedule) && data.schedule.length
    ? normalizeSchedule(data.schedule)
    : scheduleFromLegacy(data);
  return {
    schedule,
    deliveryEnabled: Boolean(data.deliveryEnabled),
    openNow: Boolean(data.openNow),
    acceptingOrders: data.acceptingOrders !== false,
    timezone: data.timezone || STORE_HOURS_TIMEZONE,
  };
}

export function toHoursPayload(ui = {}) {
  return {
    schedule: normalizeSchedule(ui.schedule),
    deliveryEnabled: Boolean(ui.deliveryEnabled),
  };
}

export function formatInterval(interval) {
  const open = normalizeTime(interval?.open, DEFAULT_OPEN);
  const close = normalizeTime(interval?.close, DEFAULT_CLOSE);
  return `${open} às ${close}`;
}

export function formatDayHours(day) {
  if (!day?.enabled || !Array.isArray(day.intervals) || day.intervals.length === 0) {
    return 'Fechado';
  }
  return day.intervals.map(formatInterval).join(' - ');
}

/** Lista Dom→Sáb para UI pública. */
export function scheduleForDisplay(schedule) {
  const normalized = normalizeSchedule(schedule);
  const byId = new Map(normalized.map((day) => [day.weekday, day]));
  return WEEKDAY_OPTIONS.map((option) => ({
    ...option,
    ...byId.get(option.id),
  }));
}

export function formatHoursRange(openingTime, closingTime) {
  return formatInterval({ open: openingTime, close: closingTime });
}

function parseHm(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function inWindow(start, end, current) {
  if (start === end) return true;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

export function isStoreOpenNow({
  schedule,
  openingTime,
  closingTime,
  openWeekdays,
  now = new Date(),
  timeZone = STORE_HOURS_TIMEZONE,
} = {}) {
  const days = Array.isArray(schedule) && schedule.length
    ? normalizeSchedule(schedule)
    : scheduleFromLegacy({ openingTime, closingTime, openWeekdays });

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const weekdayLabel = parts.find((part) => part.type === 'weekday')?.value;
  const hour = Number(parts.find((part) => part.type === 'hour')?.value);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value);
  const today = weekdayMap[weekdayLabel];
  const nowMin = hour * 60 + minute;

  const todayHours = days.find((day) => day.weekday === today);
  if (todayHours?.enabled) {
    for (const interval of todayHours.intervals) {
      const openMin = parseHm(interval.open);
      const closeMin = parseHm(interval.close);
      if (openMin != null && closeMin != null && inWindow(openMin, closeMin, nowMin)) {
        return true;
      }
    }
  }

  const previous = today === 1 ? 7 : today - 1;
  const previousHours = days.find((day) => day.weekday === previous);
  if (previousHours?.enabled) {
    for (const interval of previousHours.intervals) {
      const openMin = parseHm(interval.open);
      const closeMin = parseHm(interval.close);
      if (openMin != null && closeMin != null && openMin > closeMin && nowMin < closeMin) {
        return true;
      }
    }
  }

  return false;
}

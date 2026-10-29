import { PAYMENT_METHOD_LABELS } from '../../../../services/paymentConfigService';

export function parseMoney(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

export function methodLabel(method) {
  return PAYMENT_METHOD_LABELS[method] || method || 'Outro';
}

// O backend serializa LocalDateTime como lista Jackson [ano, mês, dia, hora, min, seg, nanos].
export function toLocalDate(value) {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nanos = 0] = value;
    return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanos / 1e6));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function cashTime(value) {
  const date = toLocalDate(value);
  if (!date) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function cashDateTime(value) {
  const date = toLocalDate(value);
  if (!date) return '';
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Diferença entre o contado e o esperado: positiva sobra, negativa falta. */
export function cashDifference(counted, expected) {
  if (counted == null) return null;
  return Math.round((counted - (Number(expected) || 0)) * 100) / 100;
}

export function differenceLabel(diff) {
  if (diff == null) return '';
  if (diff === 0) return 'Bateu certinho';
  return diff > 0 ? 'Sobra' : 'Falta';
}

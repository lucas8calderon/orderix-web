function isBlankMinutes(value) {
  return value == null || String(value).trim() === '';
}

function wholeMinutes(value) {
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const minutes = Number(text);
  if (minutes < 1 || minutes > 240) return null;
  return minutes;
}

function parseDisplayMinutes(value) {
  if (isBlankMinutes(value)) return null;
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return Math.trunc(minutes);
}

function firstDisplayMinutes(source, keys) {
  for (const key of keys) {
    const minutes = parseDisplayMinutes(source[key]);
    if (minutes != null) return minutes;
  }
  return null;
}

/** Intervalo para exibição. Valor único antigo vira mínimo = máximo. */
export function readDeliveryEstimateRange(source) {
  if (!source || typeof source !== 'object') return null;
  const min = firstDisplayMinutes(source, [
    'estimatedMinutesMin',
    'deliveryEstimatedMinutesMin',
    'estimatedMinutes',
    'deliveryEstimatedMinutes',
  ]);
  const max = firstDisplayMinutes(source, [
    'estimatedMinutesMax',
    'deliveryEstimatedMinutesMax',
    'estimatedMinutes',
    'deliveryEstimatedMinutes',
  ]);
  if (min == null && max == null) return null;
  if (min == null) return { min: max, max };
  if (max == null) return { min, max: min };
  return { min, max };
}

/** Texto do cardápio do cliente. Iguais: "previsão: 30min". Diferentes: "previsão: 30-65min". */
export function formatDeliveryEstimateLabel(source) {
  const range = readDeliveryEstimateRange(source);
  if (!range) return '';
  if (range.min === range.max) return `previsão: ${range.min}min`;
  return `previsão: ${range.min}-${range.max}min`;
}

/** Resumo no painel da loja. */
export function formatStoreEstimateSummary(source) {
  const range = readDeliveryEstimateRange(source);
  if (!range) return '';
  if (range.min === range.max) return `${range.min} min`;
  return `${range.min}-${range.max} min`;
}

/**
 * Monta o intervalo do PUT. Sem os campos novos, o número único antigo vale para os dois.
 * Com os campos novos vazios, limpa a previsão.
 */
export function deliveryEstimateForSave(ui = {}) {
  const rangeKeysPresent = Object.prototype.hasOwnProperty.call(ui, 'deliveryEstimatedMinutesMin')
    || Object.prototype.hasOwnProperty.call(ui, 'deliveryEstimatedMinutesMax');
  const minRaw = rangeKeysPresent ? ui.deliveryEstimatedMinutesMin : ui.deliveryEstimatedMinutes;
  const maxRaw = rangeKeysPresent ? ui.deliveryEstimatedMinutesMax : ui.deliveryEstimatedMinutes;
  const minBlank = isBlankMinutes(minRaw);
  const maxBlank = isBlankMinutes(maxRaw);
  if (minBlank && maxBlank) {
    return {
      estimatedMinutes: null,
      estimatedMinutesMin: null,
      estimatedMinutesMax: null,
      error: null,
    };
  }
  if (minBlank || maxBlank) {
    return { error: 'Informe o tempo mínimo e o tempo máximo' };
  }
  const min = wholeMinutes(minRaw);
  const max = wholeMinutes(maxRaw);
  if (min == null || max == null) {
    return { error: 'Tempo estimado deve ser um número inteiro entre 1 e 240 minutos' };
  }
  if (min > max) {
    return { error: 'O tempo mínimo não pode ser maior que o tempo máximo' };
  }
  return {
    estimatedMinutes: min,
    estimatedMinutesMin: min,
    estimatedMinutesMax: max,
    error: null,
  };
}

import { formatCurrency } from '../../services/accessControl';

/** Espelho da lista fictícia do backend. O componente só renderiza o que a API devolver. */
export const DEMO_LEADERBOARD_ENTRIES = Object.freeze([
  { position: 1, displayName: 'Ricardo M.', amount: 4850, highlight: true },
  { position: 2, displayName: 'Amanda S.', amount: 4210, highlight: true },
  { position: 3, displayName: 'Felipe R.', amount: 3690, highlight: true },
  { position: 4, displayName: 'Juliana C.', amount: 3250, highlight: false },
  { position: 5, displayName: 'Bruno A.', amount: 2870, highlight: false },
  { position: 6, displayName: 'Camila P.', amount: 2430, highlight: false },
  { position: 7, displayName: 'Marcos L.', amount: 1980, highlight: false },
  { position: 8, displayName: 'Fernanda T.', amount: 1640, highlight: false },
  { position: 9, displayName: 'Pedro H.', amount: 1320, highlight: false },
  { position: 10, displayName: 'Larissa B.', amount: 980, highlight: false },
]);

export const LEADERBOARD_SIMULATION_NOTE =
  'Dados ilustrativos para demonstrar o funcionamento do ranking. Não representam comissões reais.';

export const LEADERBOARD_UNRANKED_COPY = 'Você ainda não tem posição neste mês.';

export const LEADERBOARD_UNRANKED_HINT =
  'Uma loja convertida já coloca você no ranking.';

export const LEADERBOARD_LEADER_HINT =
  'Você está na frente. Cada nova loja aumenta a distância para o segundo lugar.';

export function formatLeaderboardMoney(value) {
  return formatCurrency(value);
}

export function isLeaderboardSimulation(leaderboard) {
  return !leaderboard || leaderboard.mode !== 'REAL' || leaderboard.simulation !== false;
}

export function orderedLeaderboardEntries(entries) {
  return [...(entries || [])].sort((left, right) => {
    const leftPosition = Number(left?.position);
    const rightPosition = Number(right?.position);
    const leftHasPosition = Number.isFinite(leftPosition) && leftPosition > 0;
    const rightHasPosition = Number.isFinite(rightPosition) && rightPosition > 0;
    if (leftHasPosition && rightHasPosition && leftPosition !== rightPosition) {
      return leftPosition - rightPosition;
    }
    return (Number(right?.amount) || 0) - (Number(left?.amount) || 0);
  });
}

export function summarizeLeaderboard(entries, participantCount) {
  const amounts = orderedLeaderboardEntries(entries)
    .slice(0, 10)
    .map((entry) => Number(entry.amount) || 0);
  const highest = amounts.length ? Math.max(...amounts) : 0;
  const average = amounts.length
    ? amounts.reduce((sum, value) => sum + value, 0) / amounts.length
    : 0;
  const parsedCount = Number(participantCount);
  const participants = Number.isFinite(parsedCount) ? parsedCount : (entries || []).length;
  return { highest, average, participants };
}

/**
 * A frase de posição só existe no modo REAL, com simulação desligada.
 * Sem número inteiro positivo, o texto não inventa lugar.
 */
export function viewerPositionCopy(leaderboard) {
  if (isLeaderboardSimulation(leaderboard)) return null;
  const rank = Number(leaderboard.viewerRank);
  if (!Number.isInteger(rank) || rank < 1) return LEADERBOARD_UNRANKED_COPY;
  return `Você está em ${rank}º lugar neste mês`;
}

/**
 * Frase de "próximo passo" abaixo da posição (só no modo REAL).
 * A distância usa apenas valores que vieram no payload: a linha do parceiro
 * (viewer) e a linha da posição imediatamente acima. Sem as duas, não há frase.
 */
export function viewerChaseCopy(leaderboard) {
  if (isLeaderboardSimulation(leaderboard)) return null;
  const rank = Number(leaderboard.viewerRank);
  if (!Number.isInteger(rank) || rank < 1) return LEADERBOARD_UNRANKED_HINT;
  if (rank === 1) return LEADERBOARD_LEADER_HINT;
  const entries = orderedLeaderboardEntries(leaderboard.entries);
  const viewer = entries.find((entry) => entry?.viewer === true);
  const ahead = entries.find((entry) => Number(entry?.position) === rank - 1);
  if (!viewer || !ahead) return null;
  const gap = (Number(ahead.amount) || 0) - (Number(viewer.amount) || 0);
  if (!(gap > 0)) return null;
  return `Faltam ${formatCurrency(gap)} em comissões para você passar o ${rank - 1}º lugar.`;
}

export function leaderboardPeriodLabel(year, month, fallbackLabel) {
  if (typeof fallbackLabel === 'string' && fallbackLabel.trim()) return fallbackLabel.trim();
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  if (!Number.isInteger(yearNumber) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return '';
  }
  const formatted = new Date(Date.UTC(yearNumber, monthNumber - 1, 1)).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const cleaned = formatted.replace(' de ', ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

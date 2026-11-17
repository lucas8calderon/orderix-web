import { cleanup, render, screen } from '@testing-library/react';
import axios from 'axios';
import PartnerLeaderboard from './PartnerLeaderboard';
import {
  DEMO_LEADERBOARD_ENTRIES,
  LEADERBOARD_LEADER_HINT,
  LEADERBOARD_SIMULATION_NOTE,
  LEADERBOARD_UNRANKED_COPY,
  LEADERBOARD_UNRANKED_HINT,
  formatLeaderboardMoney,
  viewerChaseCopy,
  viewerPositionCopy,
} from './partnerLeaderboardModel';

function normalized(element) {
  return element.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function demoLeaderboard(overrides = {}) {
  return {
    mode: 'DEMO',
    simulation: true,
    year: 2026,
    month: 11,
    periodLabel: 'Novembro 2026',
    entries: DEMO_LEADERBOARD_ENTRIES.map((entry) => ({ ...entry })),
    participantCount: 10,
    viewerRank: null,
    ...overrides,
  };
}

function renderBoard(leaderboard) {
  render(<PartnerLeaderboard leaderboard={leaderboard} loading={false} error="" />);
}

describe('PartnerLeaderboard', () => {
  beforeEach(() => {
    axios.get.mockClear();
  });

  it('mostra a simulação com os dez nomes, o selo e o aviso, sem consultar comissão', () => {
    const shuffled = [...DEMO_LEADERBOARD_ENTRIES].reverse();
    renderBoard(demoLeaderboard({ entries: shuffled, viewerRank: 7 }));

    expect(screen.getByRole('heading', { name: 'Ranking de Parceiros' })).toBeInTheDocument();
    expect(screen.getByText('Simulação')).toBeInTheDocument();
    expect(screen.getByText(LEADERBOARD_SIMULATION_NOTE)).toBeInTheDocument();
    expect(screen.getByText(/Comissões de Novembro 2026/)).toBeInTheDocument();
    expect(normalized(screen.getByTestId('partner-lb-highest'))).toBe(formatLeaderboardMoney(4850).replace(/\u00a0/g, ' '));
    expect(formatLeaderboardMoney(4850).replace(/\u00a0/g, ' ')).toBe('R$ 4.850,00');
    expect(screen.getByTestId('partner-lb-participants')).toHaveTextContent('10');

    const names = screen.getAllByTestId('partner-lb-name').map((node) => node.textContent);
    expect(names).toEqual(DEMO_LEADERBOARD_ENTRIES.map((entry) => entry.displayName));

    const rows = screen.getAllByTestId('partner-lb-row');
    expect(rows.slice(0, 3).every((row) => row.getAttribute('data-top') === 'true')).toBe(true);
    expect(rows.slice(3).every((row) => row.getAttribute('data-top') === 'false')).toBe(true);
    expect(screen.queryByTestId('partner-leaderboard-position')).not.toBeInTheDocument();
    expect(screen.queryByText(/Você está em/)).not.toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('no modo REAL mostra o 7º lugar e não usa o selo de simulação', () => {
    renderBoard({
      mode: 'REAL',
      simulation: false,
      year: 2026,
      month: 11,
      periodLabel: 'Novembro 2026',
      participantCount: 12,
      viewerRank: 7,
      entries: [
        { position: 1, displayName: 'Ana P.', amount: 300, highlight: true },
        { position: 7, displayName: 'Você S.', amount: 90, highlight: false, viewer: true },
      ],
    });

    expect(screen.getByTestId('partner-leaderboard-position')).toHaveTextContent(
      'Você está em 7º lugar neste mês',
    );
    expect(screen.queryByText('Simulação')).not.toBeInTheDocument();
    expect(screen.queryByText(LEADERBOARD_SIMULATION_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByText('Ricardo M.')).not.toBeInTheDocument();
    expect(screen.getByTestId('partner-lb-participants')).toHaveTextContent('12');
    // Sem a linha do 6º lugar no payload, não há como calcular a distância.
    expect(screen.queryByTestId('partner-lb-chase')).not.toBeInTheDocument();
  });

  it('no modo REAL mostra quanto falta para passar o lugar de cima', () => {
    renderBoard({
      mode: 'REAL',
      simulation: false,
      periodLabel: 'Novembro 2026',
      participantCount: 8,
      viewerRank: 5,
      entries: [
        { position: 1, displayName: 'Ana P.', amount: 300 },
        { position: 2, displayName: 'Beto R.', amount: 250 },
        { position: 3, displayName: 'Caio S.', amount: 200 },
        { position: 4, displayName: 'Duda T.', amount: 150 },
        { position: 5, displayName: 'Você S.', amount: 105.5, viewer: true },
      ],
    });

    expect(normalized(screen.getByTestId('partner-lb-chase'))).toBe(
      `Faltam ${formatLeaderboardMoney(44.5).replace(/ /g, ' ')} em comissões para você passar o 4º lugar.`,
    );
    expect(screen.getByText('você')).toBeInTheDocument();
    expect(viewerChaseCopy({ mode: 'REAL', simulation: false, viewerRank: 1, entries: [] })).toBe(LEADERBOARD_LEADER_HINT);
    expect(viewerChaseCopy({ mode: 'REAL', simulation: false, viewerRank: null })).toBe(LEADERBOARD_UNRANKED_HINT);
    expect(viewerChaseCopy({ mode: 'DEMO', simulation: true, viewerRank: 3 })).toBeNull();
  });

  it('no modo REAL não inventa posição quando o parceiro não tem comissão no mês', () => {
    renderBoard({
      mode: 'REAL',
      simulation: false,
      year: 2026,
      month: 11,
      periodLabel: 'Novembro 2026',
      participantCount: 2,
      viewerRank: null,
      entries: [
        { position: 1, displayName: 'Ana P.', amount: 80, highlight: true },
      ],
    });

    expect(screen.getByTestId('partner-leaderboard-position')).toHaveTextContent(LEADERBOARD_UNRANKED_COPY);
    expect(screen.queryByText(/Você está em \d+º/)).not.toBeInTheDocument();
    expect(viewerPositionCopy({ mode: 'REAL', simulation: false, viewerRank: null })).toBe(LEADERBOARD_UNRANKED_COPY);
    expect(viewerPositionCopy({ mode: 'DEMO', simulation: true, viewerRank: 7 })).toBeNull();
    expect(viewerPositionCopy({ mode: 'REAL', simulation: false, viewerRank: 14 })).toBe(
      'Você está em 14º lugar neste mês',
    );

    cleanup();
    renderBoard({
      mode: 'REAL',
      simulation: false,
      year: 2026,
      month: 11,
      periodLabel: 'Novembro 2026',
      participantCount: 20,
      viewerRank: 14,
      entries: [{ position: 1, displayName: 'Ana P.', amount: 80, highlight: true }],
    });
    expect(screen.getByTestId('partner-leaderboard-position')).toHaveTextContent(
      'Você está em 14º lugar neste mês',
    );
  });
});

import { Button, Skeleton } from '@mui/material';
import {
  LEADERBOARD_SIMULATION_NOTE,
  formatLeaderboardMoney,
  isLeaderboardSimulation,
  leaderboardPeriodLabel,
  orderedLeaderboardEntries,
  summarizeLeaderboard,
  viewerChaseCopy,
  viewerPositionCopy,
} from './partnerLeaderboardModel';
import './PartnerLeaderboard.css';

function barWidth(amount, highest) {
  const value = Number(amount) || 0;
  if (value <= 0 || !highest) return 0;
  return Math.max(0, Math.min(100, (value / highest) * 100));
}

function isTop(entry, index) {
  return entry.highlight === true || (entry.highlight == null && index < 3);
}

/**
 * Ranking mensal do portal autenticado.
 * Pódio para os três primeiros e lista com barras para o restante.
 * Em DEMO não há posição do parceiro; em REAL a frase usa viewerRank.
 * O DOM segue a ordem do ranking; o pódio 2-1-3 é só visual (CSS order).
 */
export default function PartnerLeaderboard({ leaderboard, loading, error, onRetry }) {
  const simulation = isLeaderboardSimulation(leaderboard);
  const entries = orderedLeaderboardEntries(leaderboard?.entries);
  const summaries = summarizeLeaderboard(entries, leaderboard?.participantCount);
  const positionCopy = viewerPositionCopy(leaderboard);
  const chaseCopy = viewerChaseCopy(leaderboard);
  const period = leaderboardPeriodLabel(leaderboard?.year, leaderboard?.month, leaderboard?.periodLabel);
  const ready = !loading && !error && leaderboard;
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <section className="partner-card partner-lb" aria-labelledby="partner-leaderboard-title">
      <header className="partner-lb-head">
        <div>
          <h2 id="partner-leaderboard-title" className="partner-card-title">Ranking de Parceiros</h2>
          {ready && (
            <p className="partner-lb-period">
              {period ? `Comissões de ${period}` : 'Comissões do mês'}
              {' · '}
              <span data-testid="partner-lb-participants">{summaries.participants}</span>
              {summaries.participants === 1 ? ' parceiro' : ' parceiros'}
            </p>
          )}
        </div>
        {ready && simulation && <span className="partner-lb-badge">Simulação</span>}
      </header>

      {loading && <Skeleton variant="rounded" height={300} />}

      {!loading && error && (
        <p role="alert" className="partner-lb-error">
          {error}
          {onRetry && (
            <Button color="inherit" size="small" onClick={onRetry} sx={{ ml: 1 }}>
              Tentar novamente
            </Button>
          )}
        </p>
      )}

      {ready && (
        <>
          {positionCopy && (
            <div className="partner-lb-you">
              <p className="partner-lb-position" data-testid="partner-leaderboard-position">{positionCopy}</p>
              {chaseCopy && <p className="partner-lb-chase" data-testid="partner-lb-chase">{chaseCopy}</p>}
            </div>
          )}

          {entries.length === 0 ? (
            <p className="partner-lb-empty">Ninguém pontuou neste mês ainda. A primeira loja convertida leva o 1º lugar.</p>
          ) : (
            <>
              <ol className="partner-lb-podium" aria-label="Três primeiros colocados">
                {podium.map((entry, index) => (
                  <li
                    key={`${entry.position}-${entry.displayName}`}
                    className={[
                      'partner-lb-step',
                      `is-p${index + 1}`,
                      entry.viewer ? 'is-viewer' : '',
                    ].filter(Boolean).join(' ')}
                    data-testid="partner-lb-row"
                    data-top={isTop(entry, index) ? 'true' : 'false'}
                  >
                    <span className="partner-lb-step-name" data-testid="partner-lb-name">{entry.displayName}</span>
                    <span className="partner-lb-step-amount" data-testid={index === 0 ? 'partner-lb-highest' : undefined}>
                      {formatLeaderboardMoney(entry.amount)}
                    </span>
                    <span className="partner-lb-step-block" aria-hidden="true">
                      <span>{entry.position}º</span>
                    </span>
                  </li>
                ))}
              </ol>

              {rest.length > 0 && (
                <ol className="partner-lb-list" start={4}>
                  {rest.map((entry, offset) => {
                    const index = offset + 3;
                    const top = isTop(entry, index);
                    return (
                      <li
                        key={`${entry.position}-${entry.displayName}`}
                        className={['partner-lb-row', top ? 'is-top' : '', entry.viewer ? 'is-viewer' : ''].filter(Boolean).join(' ')}
                        data-testid="partner-lb-row"
                        data-top={top ? 'true' : 'false'}
                      >
                        <span className="partner-lb-pos">{entry.position}º</span>
                        <span className="partner-lb-name" data-testid="partner-lb-name">
                          {entry.displayName}
                          {entry.viewer && <span className="partner-lb-you-tag">você</span>}
                        </span>
                        <span className="partner-lb-amount">{formatLeaderboardMoney(entry.amount)}</span>
                        <span className="partner-lb-track" aria-hidden="true">
                          <span
                            className="partner-lb-fill"
                            style={{ width: `${barWidth(entry.amount, summaries.highest)}%`, animationDelay: `${offset * 40}ms` }}
                          />
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}

          {simulation && <p className="partner-lb-note">{LEADERBOARD_SIMULATION_NOTE}</p>}
        </>
      )}
    </section>
  );
}

import { Button, Skeleton } from '@mui/material';
import {
  LEADERBOARD_INVITE_NOTE,
  LEADERBOARD_SIMULATION_NOTE,
  formatLeaderboardMoney,
  isLeaderboardSimulation,
  leaderboardPeriodLabel,
  orderedLeaderboardEntries,
  summarizeLeaderboard,
  viewerPositionCopy,
} from './partnerLeaderboardModel';
import './PartnerLeaderboard.css';

function barWidth(amount, highest) {
  const value = Number(amount) || 0;
  if (value <= 0 || !highest) return 0;
  return Math.max(0, Math.min(100, (value / highest) * 100));
}

/**
 * Ranking mensal do portal autenticado.
 * Recebe o payload do backend: em DEMO não há posição do parceiro;
 * em REAL a frase usa viewerRank e some quando ele é nulo.
 */
export default function PartnerLeaderboard({
  leaderboard,
  loading,
  error,
  onRetry,
  onInvite,
  inviteDisabled,
}) {
  const simulation = isLeaderboardSimulation(leaderboard);
  const entries = orderedLeaderboardEntries(leaderboard?.entries);
  const summaries = summarizeLeaderboard(entries, leaderboard?.participantCount);
  const positionCopy = viewerPositionCopy(leaderboard);
  const period = leaderboardPeriodLabel(leaderboard?.year, leaderboard?.month, leaderboard?.periodLabel);
  const showChart = !loading && !error && leaderboard;

  return (
    <section className="partner-card partner-lb" aria-labelledby="partner-leaderboard-title">
      <div className="partner-lb-head">
        <div>
          <h2 id="partner-leaderboard-title" className="partner-card-title">Ranking de Parceiros</h2>
          <p className="partner-card-subtitle">
            Confira o potencial de ganhos dos parceiros ao longo do mês.
          </p>
        </div>
        {showChart && simulation && <span className="partner-lb-badge">Simulação</span>}
      </div>

      {loading && <Skeleton variant="rounded" height={280} />}

      {!loading && error && (
        <p role="alert" style={{ color: 'var(--color-error)', fontSize: 14 }}>
          {error}
          {onRetry && (
            <Button color="inherit" size="small" onClick={onRetry} sx={{ ml: 1 }}>
              Tentar novamente
            </Button>
          )}
        </p>
      )}

      {showChart && (
        <>
          {period && <p className="partner-lb-period">Ganhos acumulados · {period}</p>}
          {positionCopy && (
            <p className="partner-lb-position" data-testid="partner-leaderboard-position">
              {positionCopy}
            </p>
          )}

          <div className="partner-lb-summaries">
            <div className="partner-lb-summary">
              <p className="partner-lb-summary-label">Maior ganho</p>
              <p className="partner-lb-summary-value" data-testid="partner-lb-highest">{formatLeaderboardMoney(summaries.highest)}</p>
            </div>
            <div className="partner-lb-summary">
              <p className="partner-lb-summary-label">Média do Top 10</p>
              <p className="partner-lb-summary-value" data-testid="partner-lb-average">{formatLeaderboardMoney(summaries.average)}</p>
            </div>
            <div className="partner-lb-summary">
              <p className="partner-lb-summary-label">Participantes</p>
              <p className="partner-lb-summary-value" data-testid="partner-lb-participants">{summaries.participants}</p>
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="partner-lb-empty">Nenhum parceiro com comissão válida neste mês.</p>
          ) : (
            <ol className="partner-lb-list">
              {entries.map((entry, index) => {
                const top = entry.highlight === true || (entry.highlight == null && index < 3);
                const width = barWidth(entry.amount, summaries.highest);
                return (
                  <li
                    key={`${entry.position}-${entry.displayName}`}
                    className={top ? 'partner-lb-row is-top' : 'partner-lb-row'}
                    data-testid="partner-lb-row"
                    data-top={top ? 'true' : 'false'}
                  >
                    <span className="partner-lb-pos">{entry.position}</span>
                    <span className="partner-lb-name" data-testid="partner-lb-name">{entry.displayName}</span>
                    <span className="partner-lb-amount">{formatLeaderboardMoney(entry.amount)}</span>
                    <div className="partner-lb-track" aria-hidden="true">
                      <span
                        className="partner-lb-fill"
                        style={{ width: `${width}%`, animationDelay: `${index * 45}ms` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {simulation && <p className="partner-lb-note">{LEADERBOARD_SIMULATION_NOTE}</p>}

          <div className="partner-lb-footer">
            <p>{LEADERBOARD_INVITE_NOTE}</p>
            <Button
              variant="contained"
              onClick={onInvite}
              disabled={inviteDisabled || !onInvite}
              sx={{
                justifySelf: 'start',
                width: { xs: '100%', sm: 'auto' },
                bgcolor: 'var(--color-primary)',
                '&:hover': { bgcolor: 'var(--color-primary-dark)' },
              }}
            >
              Convidar estabelecimentos
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

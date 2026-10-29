import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { StatusBadge } from '../../../../commons/components/StatusBadge';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatCurrency } from '../../../../services/accessControl';
import { getCashSession, listCashSessions } from '../service/cashService';
import { CashSummary } from './CashSummary';
import { cashDateTime, differenceLabel } from './cashView';

function DifferenceBadge({ value }) {
  if (value == null) return null;
  const diff = Number(value);
  const label = diff === 0 ? 'Bateu' : `${differenceLabel(diff)} ${formatCurrency(Math.abs(diff))}`;
  return <StatusBadge label={label} tone={diff === 0 ? 'success' : 'warning'} />;
}

/** Histórico de caixas da loja, do mais recente para o mais antigo. */
export function CashHistory({ visible = true, floorVersion = 0, refreshKey = 0 }) {
  const dialogProps = useDialogResponsiveProps({ paperSx: { maxWidth: 520 } });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;
    setLoading(true);
    listCashSessions({ size: 30 })
      .then((response) => {
        if (cancelled) return;
        setSessions(Array.isArray(response.data) ? response.data : []);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setSessions([]);
        setError(err?.response?.data?.message || 'Não foi possível carregar o histórico de caixas.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, floorVersion, refreshKey]);

  const openDetail = (session) => {
    getCashSession(session.id)
      .then((response) => setDetail(response.data))
      .catch(() => setDetail({ ...session, summary: null }));
  };

  return (
    <>
      <Box className="atendimento-section-header">
        <Typography variant="h5" component="h2" className="atendimento-section-title">
          Histórico de caixas
        </Typography>
      </Box>
      {loading ? <Loading loadingMessage="Carregando caixas..." /> : null}
      {!loading && error ? <EmptyState title="Não foi possível carregar" description={error} /> : null}
      {!loading && !error && sessions.length === 0 ? (
        <EmptyState title="Nenhum caixa ainda" description="Abra o caixa no topo do Atendimento para começar a acompanhar as vendas do dia." />
      ) : null}
      {!loading && !error ? (
        <Grid container spacing={2}>
          {sessions.map((session) => {
            const open = session.status === 'OPEN';
            return (
              <Grid item key={session.id} xs={12} sm={6} md={4} lg={3}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <CardActionArea onClick={() => openDetail(session)} sx={{ height: '100%', alignItems: 'stretch' }} aria-label={`Ver caixa de ${cashDateTime(session.openedAt)}`}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                        <Typography sx={{ fontWeight: 800 }}>{cashDateTime(session.openedAt)}</Typography>
                        <StatusBadge label={open ? 'Aberto' : 'Fechado'} tone={open ? 'info' : 'neutral'} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {session.openedByName ? `Aberto por ${session.openedByName}` : 'Aberto'}
                        {session.closedAt ? ` · fechado ${cashDateTime(session.closedAt)}` : ''}
                      </Typography>
                      {open ? (
                        <Typography sx={{ mt: 1 }}>Em andamento</Typography>
                      ) : (
                        <>
                          <Typography sx={{ mt: 1, fontWeight: 700 }}>
                            {formatCurrency(session.salesTotal)} · {session.ordersCount ?? 0} {session.ordersCount === 1 ? 'pedido' : 'pedidos'}
                          </Typography>
                          <Box sx={{ mt: 1 }}><DifferenceBadge value={session.difference} /></Box>
                        </>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : null}

      <Dialog {...dialogProps} open={Boolean(detail)} onClose={() => setDetail(null)} aria-labelledby="cash-detail-title">
        <DialogTitle id="cash-detail-title">Caixa de {cashDateTime(detail?.openedAt)}</DialogTitle>
        <DialogContent dividers>
          <CashSummary session={detail} />
          {detail?.status === 'CLOSED' ? (
            <Box sx={{ mt: 2, display: 'grid', gap: 0.5 }}>
              <Typography>Contado na gaveta: <strong>{formatCurrency(detail.countedCash)}</strong></Typography>
              <Box><DifferenceBadge value={detail.difference} /></Box>
              {detail.closedByName ? <Typography variant="body2" color="text.secondary">Fechado por {detail.closedByName}</Typography> : null}
              {detail.notes ? <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>Obs.: {detail.notes}</Typography> : null}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

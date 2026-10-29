import { useCallback, useEffect, useState } from 'react';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import { formatCurrency } from '../../../../services/accessControl';
import { getCurrentCash } from '../service/cashService';
import { CashMovementDialog, CloseCashDialog, OpenCashDialog } from './CashDialogs';
import { cashTime } from './cashView';

/**
 * Situação do caixa no topo do Atendimento. Não bloqueia vendas: com o caixa fechado,
 * só convida a abrir. Recarrega quando o atendimento muda (pagamentos, pedidos).
 */
export function CashBar({ floorVersion = 0, onChange }) {
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState('');
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => {
    getCurrentCash()
      .then((current) => {
        setSession(current);
        setError('');
        onChange?.(current);
      })
      .catch((err) => {
        setError(err?.response?.status === 403 ? '' : 'Não foi possível consultar o caixa.');
      })
      .finally(() => setLoaded(true));
  }, [onChange]);

  useEffect(() => {
    refresh();
  }, [refresh, floorVersion]);

  const done = (next, message) => {
    setDialog('');
    setToast(message);
    const open = next?.status === 'OPEN' ? next : null;
    setSession(open);
    onChange?.(open);
  };

  if (!loaded) return null;

  const summary = session?.summary;
  return (
    <>
      <Box className={`cash-bar ${session ? 'is-open' : 'is-closed'}`} role="region" aria-label="Caixa">
        <PointOfSaleOutlinedIcon className="cash-bar__icon" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {session ? (
            <>
              <Typography sx={{ fontWeight: 800 }}>
                Caixa aberto desde {cashTime(session.openedAt)}
                {session.openedByName ? ` · ${session.openedByName}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary
                  ? `${formatCurrency(summary.salesTotal)} em ${summary.ordersCount} ${summary.ordersCount === 1 ? 'pedido' : 'pedidos'} · na gaveta: ${formatCurrency(summary.expectedCash)}`
                  : ''}
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 800 }}>Caixa fechado</Typography>
              <Typography variant="body2" color="text.secondary">
                {error || 'Abra o caixa para começar o dia e acompanhar o que foi vendido.'}
              </Typography>
            </>
          )}
        </Box>
        <Box className="cash-bar__actions">
          {session ? (
            <>
              <Button onClick={() => setDialog('movement')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Sangria / Suprimento
              </Button>
              <Button variant="contained" color="error" disableElevation onClick={() => setDialog('close')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
                Fechar caixa
              </Button>
            </>
          ) : (
            <Button variant="contained" disableElevation onClick={() => setDialog('open')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
              Abrir caixa
            </Button>
          )}
        </Box>
      </Box>

      <OpenCashDialog open={dialog === 'open'} onClose={() => setDialog('')} onDone={done} />
      <CashMovementDialog open={dialog === 'movement'} session={session} onClose={() => setDialog('')} onDone={done} />
      <CloseCashDialog open={dialog === 'close'} session={session} onClose={() => setDialog('')} onDone={done} />
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast('')} severity="success" sx={{ width: '100%' }}>{toast}</Alert>
      </Snackbar>
    </>
  );
}

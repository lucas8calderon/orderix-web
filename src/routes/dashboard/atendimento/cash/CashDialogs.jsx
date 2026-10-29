import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatCurrency } from '../../../../services/accessControl';
import { addCashMovement, closeCash, newCashKey, openCash } from '../service/cashService';
import { CashSummary } from './CashSummary';
import { cashDifference, differenceLabel, parseMoney } from './cashView';

function apiMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function MoneyField({ label, value, onChange, autoFocus = false, helperText }) {
  return (
    <TextField
      fullWidth
      label={label}
      type="number"
      value={value}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
      inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }}
      InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
      helperText={helperText}
    />
  );
}

// Uma chave por tentativa: repetir o clique reenvia a mesma operação, sem duplicar.
function useAttemptKey(open) {
  const keyRef = useRef('');
  useEffect(() => {
    if (open) keyRef.current = newCashKey();
  }, [open]);
  return keyRef;
}

export function OpenCashDialog({ open, onClose, onDone }) {
  const dialogProps = useDialogResponsiveProps({ fullScreenOnMobile: false, paperSx: { maxWidth: 440 } });
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const keyRef = useAttemptKey(open);

  useEffect(() => {
    if (open) {
      setAmount('');
      setError('');
    }
  }, [open]);

  const submit = async () => {
    const value = amount === '' ? 0 : parseMoney(amount);
    if (value == null || value < 0) {
      setError('Informe um valor maior ou igual a zero.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await openCash({ openingAmount: value }, keyRef.current);
      onDone?.(response.data, 'Caixa aberto.');
    } catch (err) {
      setError(apiMessage(err, 'Não foi possível abrir o caixa.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog {...dialogProps} open={open} onClose={saving ? undefined : onClose} aria-labelledby="open-cash-title">
      <DialogTitle id="open-cash-title">Abrir caixa</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Informe quanto dinheiro está na gaveta para troco. As vendas fechadas a partir de agora entram neste caixa.
        </Typography>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <MoneyField label="Dinheiro inicial (troco)" value={amount} onChange={setAmount} autoFocus />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" disableElevation onClick={submit} disabled={saving} sx={{ fontWeight: 700 }}>
          {saving ? 'Abrindo...' : 'Abrir caixa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CashMovementDialog({ open, session, onClose, onDone }) {
  const dialogProps = useDialogResponsiveProps({ fullScreenOnMobile: false, paperSx: { maxWidth: 440 } });
  const [type, setType] = useState('WITHDRAWAL');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const keyRef = useAttemptKey(open);

  useEffect(() => {
    if (open) {
      setType('WITHDRAWAL');
      setAmount('');
      setReason('');
      setError('');
    }
  }, [open]);

  const submit = async () => {
    const value = parseMoney(amount);
    if (value == null || value <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await addCashMovement(session.id, { type, amount: value, reason }, keyRef.current);
      onDone?.(response.data, type === 'SUPPLY' ? 'Suprimento registrado.' : 'Sangria registrada.');
    } catch (err) {
      setError(apiMessage(err, 'Não foi possível registrar o movimento.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog {...dialogProps} open={open} onClose={saving ? undefined : onClose} aria-labelledby="cash-movement-title">
      <DialogTitle id="cash-movement-title">Sangria ou suprimento</DialogTitle>
      <DialogContent>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={type}
          onChange={(_event, value) => value && setType(value)}
          aria-label="Tipo de movimento"
          className="cash-type-toggle"
          sx={{ mb: 1 }}
        >
          <ToggleButton value="WITHDRAWAL">Sangria (retirar)</ToggleButton>
          <ToggleButton value="SUPPLY">Suprimento (colocar)</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {type === 'WITHDRAWAL'
            ? 'Dinheiro tirado da gaveta, por exemplo para o cofre ou um pagamento.'
            : 'Dinheiro colocado na gaveta, por exemplo para reforçar o troco.'}
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <MoneyField label="Valor" value={amount} onChange={setAmount} autoFocus />
          <TextField
            fullWidth
            label="Motivo (opcional)"
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 255))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" disableElevation onClick={submit} disabled={saving} sx={{ fontWeight: 700 }}>
          {saving ? 'Salvando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CloseCashDialog({ open, session, onClose, onDone }) {
  const dialogProps = useDialogResponsiveProps({ paperSx: { maxWidth: 520 } });
  const [counted, setCounted] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const keyRef = useAttemptKey(open);

  useEffect(() => {
    if (open) {
      setCounted('');
      setNotes('');
      setError('');
    }
  }, [open]);

  const expected = session?.summary?.expectedCash;
  const countedValue = parseMoney(counted);
  const diff = cashDifference(countedValue, expected);

  const submit = async () => {
    if (countedValue == null || countedValue < 0) {
      setError('Conte o dinheiro da gaveta e informe o valor.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await closeCash(session.id, { countedCash: countedValue, notes }, keyRef.current);
      onDone?.(response.data, 'Caixa fechado.');
    } catch (err) {
      setError(apiMessage(err, 'Não foi possível fechar o caixa.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog {...dialogProps} open={open} onClose={saving ? undefined : onClose} aria-labelledby="close-cash-title">
      <DialogTitle id="close-cash-title">Fechar caixa</DialogTitle>
      <DialogContent dividers>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <CashSummary session={session} />
        <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <MoneyField
            label="Dinheiro contado na gaveta"
            value={counted}
            onChange={setCounted}
            helperText="Conte as notas e moedas e informe o total."
          />
          {diff != null ? (
            <Alert severity={diff === 0 ? 'success' : 'warning'} role="status">
              {differenceLabel(diff)}{diff !== 0 ? `: ${formatCurrency(Math.abs(diff))}` : ''}
            </Alert>
          ) : null}
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Observação (opcional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value.slice(0, 500))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" color="error" disableElevation onClick={submit} disabled={saving} sx={{ fontWeight: 700 }}>
          {saving ? 'Fechando...' : 'Fechar caixa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import '../../../services/apiConfig';
import { formatCurrency } from '../../../services/accessControl';
import { formatPlanDate, planChangeMessage, planLabel } from '../planChangeMessage';

function messageOf(error, fallback) {
  const text = error?.response?.data?.message;
  return typeof text === 'string' && text.trim() ? text : fallback;
}

export default function PlanChangeDialog({ storeId, onClose, onChanged }) {
  const [options, setOptions] = useState(null);
  const [newPlan, setNewPlan] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get(`/api/billing/subscriptions/${storeId}/plan-changes/options`)
      .then((response) => {
        if (!active) return;
        setOptions(response.data);
        const open = response.data?.openChange;
        if (open) {
          setNewPlan(open.newPlan);
          setBillingDate(String(open.firstBillingDate || '').slice(0, 10));
        }
      })
      .catch((failure) => {
        if (active) setError(messageOf(failure, 'Não foi possível abrir a alteração de plano.'));
      });
    return () => {
      active = false;
    };
  }, [storeId]);

  const selected = (options?.plans || []).find((plan) => plan.code === newPlan);
  const preview = options && newPlan && billingDate
    ? planChangeMessage({
      storeName: options.storeName,
      currentPlan: options.currentPlan,
      currentAmount: options.currentAmount,
      newPlan,
      newAmount: selected?.amount,
      firstBillingDate: billingDate,
    })
    : '';

  async function copyMessage() {
    setCopied(false);
    setError('');
    if (!preview) {
      setError('Escolha o plano e a data para gerar a mensagem.');
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard');
      }
      await navigator.clipboard.writeText(preview);
      setCopied(true);
    } catch (failure) {
      setError('Não foi possível copiar. Selecione o texto da mensagem e copie manualmente.');
    }
  }

  async function saveAwaiting() {
    setBusy(true);
    setError('');
    try {
      await axios.post(`/api/billing/subscriptions/${storeId}/plan-changes`, {
        newPlan,
        firstBillingDate: billingDate,
        reason: 'Alteração combinada com o cliente.',
      });
      setNotice('Alteração registrada. Ela ainda aguarda a confirmação do cliente.');
      onChanged();
      const response = await axios.get(`/api/billing/subscriptions/${storeId}/plan-changes/options`);
      setOptions(response.data);
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível registrar a alteração.'));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCustomer() {
    if (!options?.openChange?.id) return;
    setBusy(true);
    setError('');
    try {
      await axios.post(
        `/api/billing/subscriptions/${storeId}/plan-changes/${options.openChange.id}/confirm`,
        { reference: reference.trim() || 'Confirmado pelo cliente.' },
      );
      setNotice('Confirmação registrada. A alteração fica agendada até a data da cobrança.');
      onChanged();
      const response = await axios.get(`/api/billing/subscriptions/${storeId}/plan-changes/options`);
      setOptions(response.data);
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível registrar a confirmação.'));
    } finally {
      setBusy(false);
    }
  }

  async function cancelChange() {
    if (!options?.openChange?.id) return;
    setBusy(true);
    setError('');
    try {
      await axios.post(
        `/api/billing/subscriptions/${storeId}/plan-changes/${options.openChange.id}/cancel`,
        { reason: 'Cancelada pelo administrador antes da execução.' },
      );
      setNotice('Alteração cancelada. O plano atual permanece.');
      onChanged();
      const response = await axios.get(`/api/billing/subscriptions/${storeId}/plan-changes/options`);
      setOptions(response.data);
      setNewPlan('');
      setBillingDate('');
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível cancelar a alteração.'));
    } finally {
      setBusy(false);
    }
  }

  async function reschedule() {
    if (!options?.openChange?.id) return;
    setBusy(true);
    setError('');
    try {
      await axios.put(`/api/billing/subscriptions/${storeId}/plan-changes/${options.openChange.id}`, {
        firstBillingDate: billingDate,
      });
      setNotice('Data reagendada.');
      onChanged();
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível reagendar.'));
    } finally {
      setBusy(false);
    }
  }

  const open = options?.openChange;
  const awaiting = open?.status === 'AWAITING_CONFIRMATION';
  const scheduled = open?.status === 'SCHEDULED';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Alterar plano</DialogTitle>
      <DialogContent>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {notice ? <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert> : null}
        {copied ? <Alert severity="success" sx={{ mb: 2 }}>Mensagem copiada.</Alert> : null}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Plano atual: {options ? planLabel(options.currentPlan) : '—'}
          {' · '}
          {options ? formatCurrency(options.currentAmount) : '—'}
        </Typography>
        <Stack spacing={2}>
          <TextField
            select
            label="Novo plano"
            value={newPlan}
            onChange={(event) => { setNewPlan(event.target.value); setCopied(false); }}
            disabled={!options || scheduled}
            fullWidth
          >
            {(options?.plans || []).map((plan) => (
              <MenuItem key={plan.code} value={plan.code}>
                {plan.label} — {formatCurrency(plan.amount)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Primeira cobrança no novo valor"
            value={billingDate}
            onChange={(event) => { setBillingDate(event.target.value); setCopied(false); }}
            disabled={!options}
            fullWidth
          >
            {(options?.dates || []).map((date) => {
              const iso = String(date).slice(0, 10);
              return <MenuItem key={iso} value={iso}>{formatPlanDate(iso)}</MenuItem>;
            })}
          </TextField>
          <TextField
            label="Mensagem para o cliente"
            value={preview}
            multiline
            minRows={8}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          {awaiting ? (
            <TextField
              label="Referência da confirmação"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Ex.: cliente confirmou no WhatsApp"
              fullWidth
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="outlined" onClick={copyMessage} disabled={!preview}>Copiar mensagem</Button>
        {!open ? (
          <Button variant="contained" onClick={saveAwaiting} disabled={busy || !preview}>Registrar alteração</Button>
        ) : null}
        {awaiting ? (
          <Button variant="contained" onClick={confirmCustomer} disabled={busy}>Registrar confirmação do cliente</Button>
        ) : null}
        {open && (awaiting || scheduled) ? (
          <Button variant="outlined" onClick={reschedule} disabled={busy || !billingDate}>Reagendar</Button>
        ) : null}
        {open && (awaiting || scheduled) ? (
          <Button color="error" onClick={cancelChange} disabled={busy}>Cancelar alteração</Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

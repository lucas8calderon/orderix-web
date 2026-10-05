import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '../../../commons/components/PageHeader';
import { Loading } from '../../../commons/components/Loading';
import { EmptyState } from '../../../commons/components/EmptyState';
import {
  adjustInventory,
  getInventoryMovements,
  getInventorySnapshot,
} from '../../../services/inventoryService';

const MOVEMENT_LABELS = {
  SALE: 'Venda',
  CANCEL_RESTORE: 'Estorno',
  RESTOCK: 'Entrada',
  ADJUST: 'Ajuste',
};

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function stockTone(item) {
  if (!item?.trackInventory) return 'off';
  if (Number(item.stockQuantity) <= 0) return 'out';
  if (Number(item.stockQuantity) <= Number(item.minimumStock)) return 'low';
  return 'ok';
}

export default function InventoryPanel() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([getInventorySnapshot(), getInventoryMovements()])
      .then(([snapshot, movementResponse]) => {
        setItems(snapshot.data?.items || []);
        setMovements(movementResponse.data || []);
        setError('');
      })
      .catch((err) => {
        setError(apiMessage(err, 'Não foi possível carregar o estoque.'));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdjust = (item, direction) => {
    setDraft({ item, direction });
    setQuantity('1');
    setNote('');
    setFormError('');
  };

  const submitAdjust = () => {
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount <= 0) {
      setFormError('Informe uma quantidade inteira maior que zero.');
      return;
    }
    const signed = draft.direction === 'out' ? -amount : amount;
    setSaving(true);
    setFormError('');
    adjustInventory({
      productId: draft.item.productId,
      type: draft.direction === 'in' ? 'RESTOCK' : 'ADJUST',
      quantity: signed,
      note: note.trim() || null,
    })
      .then(() => {
        setDraft(null);
        return load();
      })
      .catch((err) => {
        setFormError(apiMessage(err, 'Não foi possível atualizar o saldo.'));
      })
      .finally(() => setSaving(false));
  };

  const lowCount = items.filter((item) => stockTone(item) === 'low').length;
  const outCount = items.filter((item) => stockTone(item) === 'out').length;

  return (
    <Box>
      <PageHeader
        title="Estoque"
        description="Saldo dos produtos desta loja. Entrada e saída gravam na API."
        actions={<Button onClick={load} disabled={loading}>Atualizar</Button>}
      />
      {loading ? <Loading loadingMessage="Carregando estoque..." /> : null}
      {!loading && error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="Nenhum produto no estoque" description="Cadastre produtos no catálogo para controlar o saldo." />
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            {lowCount} com estoque baixo · {outCount} sem estoque
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.5 }}>
            {items.map((item) => (
              <Box component="li" key={item.productId} sx={{ border: '1px solid var(--color-border)', borderRadius: 2, p: 2 }}>
                <Typography fontWeight={700}>{item.name}</Typography>
                <Typography color="text.secondary">
                  Saldo {item.stockQuantity} · mínimo {item.minimumStock}
                  {item.trackInventory ? '' : ' · sem controle'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={() => openAdjust(item, 'in')}>Entrada</Button>
                  <Button size="small" onClick={() => openAdjust(item, 'out')}>Saída</Button>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography component="h2" sx={{ mt: 4, mb: 1, fontWeight: 700 }}>Movimentos</Typography>
          {movements.length === 0 ? (
            <Typography color="text.secondary">Nenhum movimento registrado.</Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {movements.map((movement) => (
                <Box component="li" key={movement.id} sx={{ py: 0.75 }}>
                  {MOVEMENT_LABELS[movement.type] || movement.type} · {movement.productName} · {movement.quantity}
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : null}

      <Dialog open={Boolean(draft)} onClose={saving ? undefined : () => setDraft(null)} fullWidth maxWidth="xs">
        <DialogTitle>{draft?.direction === 'out' ? 'Saída' : 'Entrada'} de {draft?.item?.name}</DialogTitle>
        <DialogContent>
          {formError ? <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert> : null}
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Quantidade"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Observação"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDraft(null)} disabled={saving}>Cancelar</Button>
          <Button onClick={submitAdjust} disabled={saving}>Gravar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

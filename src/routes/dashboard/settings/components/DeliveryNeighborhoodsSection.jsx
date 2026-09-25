import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatCurrency } from '../../../../services/accessControl';
import {
  createStoreNeighborhood,
  deleteStoreNeighborhood,
  listStoreNeighborhoods,
  updateStoreNeighborhood,
} from '../../../../services/deliveryNeighborhoodService';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../utils/currencyInput';
import { isValidStoreWhatsApp } from '../../../public-delivery/utils/neighborhoodWhatsApp';
import { effectiveNeighborhoodFee } from '../../../public-delivery/utils/neighborhoodPlace';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const FEE_MODES = [
  {
    id: 'PER_NEIGHBORHOOD',
    label: 'Taxa por bairro',
    hint: 'Cada bairro ativo usa a taxa cadastrada nele.',
  },
  {
    id: 'FREE_SELECTED',
    label: 'Grátis em bairros selecionados',
    hint: 'Os bairros marcados saem grátis. Os demais usam a taxa cadastrada.',
  },
  {
    id: 'FREE_ALL',
    label: 'Grátis em todos os bairros atendidos',
    hint: 'Todos os bairros ativos ficam grátis. Bairros que não estão cadastrados não são atendidos.',
  },
];

const emptyDraft = {
  state: 'SP',
  city: '',
  name: '',
  fee: 0,
  freeDelivery: false,
  active: true,
};

function feeLabel(value) {
  return Number(value) === 0 ? 'Entrega grátis' : formatCurrency(value);
}

export function DeliveryNeighborhoodsSection({ settings, onSettingChange }) {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    listStoreNeighborhoods()
      .then((response) => {
        setRows(response.data || []);
        setLoadError('');
      })
      .catch((error) => {
        setLoadError(error?.response?.data?.message || 'Não foi possível carregar os bairros.');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mode = settings?.deliveryFeeMode || 'PER_NEIGHBORHOOD';
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => `${row.name} ${row.city} ${row.state}`.toLowerCase().includes(term));
  }, [rows, query]);
  const freeNames = rows.filter((row) => row.freeDelivery && row.active).map((row) => row.name);

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setDraft({
      state: row.state,
      city: row.city,
      name: row.name,
      fee: Number(row.fee || 0),
      freeDelivery: Boolean(row.freeDelivery),
      active: row.active !== false,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const saveRow = async () => {
    if (!draft.city.trim() || !draft.name.trim() || !draft.state) {
      setFormError('Informe UF, cidade e o nome do bairro.');
      return;
    }
    setSaving(true);
    setFormError('');
    const payload = {
      state: draft.state,
      city: draft.city.trim(),
      name: draft.name.trim(),
      fee: Number(draft.fee || 0),
      freeDelivery: Boolean(draft.freeDelivery),
      active: Boolean(draft.active),
    };
    try {
      if (editing) {
        await updateStoreNeighborhood(editing.id, payload);
      } else {
        await createStoreNeighborhood(payload);
      }
      setDialogOpen(false);
      load();
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Não foi possível salvar o bairro.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row) => {
    try {
      await updateStoreNeighborhood(row.id, { ...row, active: !row.active });
      load();
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Não foi possível alterar a situação do bairro.');
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Excluir o bairro ${row.name}?`)) return;
    try {
      await deleteStoreNeighborhood(row.id);
      load();
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Não foi possível excluir o bairro.');
    }
  };

  return (
    <Box className="delivery-group">
      <Typography className="delivery-group__title" component="h3">
        Bairros atendidos
      </Typography>
      <Box className="setting-item">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          A entrega passa a usar estes bairros. A taxa única da operação só vale enquanto não houver nenhum bairro cadastrado.
          Trocar o modo não apaga as taxas nem a seleção de grátis. Salve o Delivery para aplicar o modo.
        </Typography>
        {!isValidStoreWhatsApp(settings?.storePhone) ? (
          <Alert severity="warning" role="status" sx={{ mb: 1.5 }}>
            WhatsApp da loja pendente. Cadastre um telefone válido da loja para o cliente pedir a inclusão de um bairro.
            Sem isso, a solicitação pelo WhatsApp não abre.
          </Alert>
        ) : null}
        {FEE_MODES.map((option) => (
          <FormControlLabel
            key={option.id}
            sx={{ display: 'flex', alignItems: 'flex-start', ml: 0 }}
            control={(
              <input
                type="radio"
                name="deliveryFeeMode"
                checked={mode === option.id}
                onChange={() => onSettingChange('deliveryFeeMode', null, option.id)}
                aria-label={option.label}
              />
            )}
            label={(
              <Box sx={{ ml: 1, mb: 1 }}>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">{option.hint}</Typography>
              </Box>
            )}
          />
        ))}
        {mode === 'FREE_SELECTED' ? (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Grátis agora:
            {' '}
            {freeNames.length ? freeNames.join(', ') : 'nenhum bairro marcado. Marque em cada linha ou na edição.'}
          </Typography>
        ) : null}
        {mode === 'FREE_ALL' ? (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Todos os bairros ativos desta loja estão com entrega grátis. Bairros fora da lista não são atendidos.
          </Alert>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <TextField
            size="small"
            label="Pesquisar bairro ou cidade"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ flex: '1 1 220px' }}
          />
          <Button variant="outlined" onClick={openCreate}>Novo bairro</Button>
        </Box>
        {loadError ? <Alert severity="error" sx={{ mb: 1 }}>{loadError}</Alert> : null}
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum bairro nesta lista. Cadastre UF, cidade, nome e a taxa. Taxa R$ 0,00 é permitida.
          </Typography>
        ) : (
          <NeighborhoodTable
            rows={filtered}
            mode={mode}
            onEdit={openEdit}
            onToggle={toggleActive}
            onDelete={remove}
          />
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar bairro' : 'Novo bairro'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="UF"
            sx={{ mt: 1, mb: 1.5 }}
            value={draft.state}
            onChange={(event) => setDraft((prev) => ({ ...prev, state: event.target.value }))}
          >
            {STATES.map((uf) => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            label="Cidade"
            sx={{ mb: 1.5 }}
            value={draft.city}
            onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
          />
          <TextField
            fullWidth
            label="Nome do bairro"
            sx={{ mb: 1.5 }}
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
          />
          <TextField
            fullWidth
            label="Taxa de entrega"
            sx={{ mb: 1.5 }}
            value={formatCurrencyInput(draft.fee)}
            onChange={(event) => {
              const parsed = parseCurrencyInput(event.target.value);
              setDraft((prev) => ({ ...prev, fee: parsed === '' ? 0 : parsed }));
            }}
            inputProps={{ inputMode: 'numeric', 'aria-label': 'Taxa do bairro em reais' }}
          />
          <FormControlLabel
            control={(
              <Switch
                checked={draft.freeDelivery}
                onChange={(event) => setDraft((prev) => ({ ...prev, freeDelivery: event.target.checked }))}
              />
            )}
            label="Grátis neste bairro, quando o modo for por seleção"
          />
          <FormControlLabel
            control={(
              <Switch
                checked={draft.active}
                onChange={(event) => setDraft((prev) => ({ ...prev, active: event.target.checked }))}
              />
            )}
            label="Ativo para novos clientes"
          />
          {formError ? <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={saving} onClick={saveRow}>
            {saving ? 'Salvando...' : 'Salvar bairro'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function NeighborhoodTable({ rows, mode, onEdit, onToggle, onDelete }) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '1.2fr 1fr 0.8fr 0.9fr 0.7fr auto',
          gap: 1,
          px: 1.25,
        }}
      >
        {['Bairro', 'Cidade/UF', 'Taxa cadastrada', 'Taxa efetiva', 'Situação', 'Ações'].map((label) => (
          <Typography key={label} variant="caption" color="text.secondary">{label}</Typography>
        ))}
      </Box>
      {rows.map((row) => {
        const offered = row.active !== false;
        const effective = offered
          ? effectiveNeighborhoodFee(mode, row.fee, Boolean(row.freeDelivery))
          : null;
        return (
          <Box
            key={row.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 0.8fr 0.9fr 0.7fr auto' },
              gap: 1,
              alignItems: 'center',
              p: 1.25,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2"><strong>{row.name}</strong></Typography>
            <Typography variant="body2">{row.city}/{row.state}</Typography>
            <Typography variant="body2">{formatCurrency(row.fee)}</Typography>
            <Typography variant="body2">{effective == null ? 'Não oferecido' : feeLabel(effective)}</Typography>
            <Typography variant="body2">{row.active === false ? 'Inativo' : 'Ativo'}</Typography>
            <Box>
              <IconButton aria-label={`Editar ${row.name}`} onClick={() => onEdit(row)} size="small">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <Button size="small" onClick={() => onToggle(row)}>
                {row.active === false ? 'Ativar' : 'Desativar'}
              </Button>
              <IconButton aria-label={`Excluir ${row.name}`} onClick={() => onDelete(row)} size="small">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { listPublicNeighborhoods } from '../../../services/deliveryNeighborhoodService';
import { cepDigits, formatCepInput, isValidCep } from '../../../utils/cepInput';
import { CEP_NOT_FOUND, lookupCep } from '../../../services/viaCepService';
import {
  deliveryCoverageLabel,
  matchNeighborhood,
  placeKey,
  selectionStillValid,
} from '../utils/neighborhoodPlace';
import {
  isValidStoreWhatsApp,
  neighborhoodWhatsAppUrl,
} from '../utils/neighborhoodWhatsApp';

const emptyForm = {
  addressId: '',
  postalCode: '',
  street: '',
  number: '',
  complement: '',
  reference: '',
  city: '',
  state: '',
  neighborhoodId: '',
  viaCepNeighborhood: '',
  viaCepCity: '',
};

export default function DeliveryAddressGate({
  open,
  onClose,
  onConfirm,
  slug,
  catalog,
  addresses = [],
  initial = null,
}) {
  const [form, setForm] = useState(emptyForm);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [areasReady, setAreasReady] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [cepLookup, setCepLookup] = useState({ status: 'idle', message: '' });
  const [error, setError] = useState('');
  const [asking, setAsking] = useState(false);
  const [requestedName, setRequestedName] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setAsking(false);
    setRequestedName('');
    setNeighborhoods([]);
    setForm(initial ? {
      ...emptyForm,
      addressId: initial.addressId ? String(initial.addressId) : '',
      postalCode: formatCepInput(initial.postalCode || ''),
      street: initial.street || '',
      number: initial.number || '',
      complement: initial.complement || '',
      reference: initial.reference || '',
      city: initial.city || '',
      state: initial.state || '',
      neighborhoodId: initial.neighborhoodId ? String(initial.neighborhoodId) : '',
    } : emptyForm);
  }, [open, initial]);

  useEffect(() => {
    if (!open || form.addressId) {
      setCepLookup({ status: 'idle', message: '' });
      return undefined;
    }
    const cep = cepDigits(form.postalCode);
    if (cep.length !== 8) {
      setCepLookup({ status: 'idle', message: '' });
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCepLookup({ status: 'loading', message: 'Consultando CEP...' });
      lookupCep(cep, { signal: controller.signal })
        .then((found) => {
          if (controller.signal.aborted) return;
          setForm((prev) => {
            if (cepDigits(prev.postalCode) !== cep || prev.addressId) return prev;
            return {
              ...prev,
              postalCode: found.postalCode || prev.postalCode,
              street: found.street,
              city: found.city,
              state: found.state,
              viaCepNeighborhood: found.neighborhood || '',
              viaCepCity: found.city || '',
              neighborhoodId: '',
            };
          });
          setCepLookup({
            status: 'ok',
            message: found.street
              ? 'Endereço encontrado. Escolha o bairro onde ele realmente fica.'
              : 'CEP encontrado. Informe rua, número e o bairro.',
          });
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          setCepLookup({
            status: 'error',
            message: err?.code === CEP_NOT_FOUND
              ? 'CEP não encontrado. Confira ou preencha o endereço e escolha o bairro.'
              : 'Não foi possível consultar o CEP. Preencha o endereço e escolha o bairro.',
          });
        });
    }, 280);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, form.addressId, form.postalCode]);

  useEffect(() => {
    if (!open || !slug || form.state.trim().length !== 2 || !form.city.trim()) {
      setNeighborhoods([]);
      setAreasReady(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoadingAreas(true);
    setAreasReady(false);
    listPublicNeighborhoods(slug, { state: form.state.trim(), city: form.city.trim() })
      .then((response) => {
        if (controller.signal.aborted) return;
        setNeighborhoods(response.data || []);
        setAreasReady(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setNeighborhoods([]);
          setAreasReady(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingAreas(false);
      });
    return () => controller.abort();
  }, [open, slug, form.state, form.city]);

  useEffect(() => {
    if (!open || !areasReady) return;
    setForm((prev) => {
      if (selectionStillValid(neighborhoods, prev.neighborhoodId)) return prev;
      const sameCity = placeKey(prev.city) && placeKey(prev.city) === placeKey(prev.viaCepCity);
      const matched = sameCity ? matchNeighborhood(neighborhoods, prev.viaCepNeighborhood) : null;
      if (matched) {
        return { ...prev, neighborhoodId: String(matched.id) };
      }
      if (prev.neighborhoodId) return { ...prev, neighborhoodId: '' };
      return prev;
    });
  }, [open, areasReady, neighborhoods]);

  const selected = useMemo(
    () => neighborhoods.find((item) => String(item.id) === String(form.neighborhoodId)) || null,
    [neighborhoods, form.neighborhoodId]
  );

  const applySaved = (address) => {
    if (!address) {
      setForm((prev) => ({ ...emptyForm, addressId: '' }));
      return;
    }
    setAsking(false);
    setForm({
      ...emptyForm,
      addressId: String(address.id),
      postalCode: formatCepInput(address.postalCode || ''),
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      reference: address.reference || '',
      city: address.city || '',
      state: address.state || '',
      neighborhoodId: address.neighborhoodId ? String(address.neighborhoodId) : '',
    });
  };

  const confirm = () => {
    if (!isValidCep(form.postalCode) || !form.street.trim() || !form.number.trim()
      || !form.city.trim() || form.state.trim().length !== 2) {
      setError('Preencha CEP, rua, número, cidade e UF.');
      return;
    }
    if (!selected) {
      setError('Escolha um bairro atendido nesta cidade. Sem isso a entrega não é concluída.');
      return;
    }
    setError('');
    onConfirm({
      addressId: form.addressId || '',
      postalCode: cepDigits(form.postalCode),
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim(),
      reference: form.reference.trim(),
      city: selected.city,
      state: selected.state,
      neighborhoodId: selected.id,
      neighborhood: selected.name,
      effectiveFee: Number(selected.effectiveFee || 0),
    });
  };

  const sendWhatsApp = () => {
    const name = requestedName.trim();
    if (!name) {
      setError('Informe o nome do bairro para enviar a solicitação.');
      return;
    }
    const url = neighborhoodWhatsAppUrl(catalog?.phone, catalog?.storeName, name);
    if (!url) {
      setError('Esta loja ainda não tem um WhatsApp válido cadastrado. A loja precisa informar o telefone nas configurações. A solicitação não conclui o pedido.');
      return;
    }
    setError('');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Onde você quer receber?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Escolha o bairro onde o endereço realmente fica. A lista mostra somente os bairros ativos desta loja nesta cidade e UF.
        </Typography>
        {addresses.length > 0 ? (
          <FormControl sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Endereços salvos</Typography>
            <RadioGroup
              value={form.addressId || ''}
              onChange={(event) => {
                const value = event.target.value;
                applySaved(addresses.find((item) => String(item.id) === value) || null);
              }}
            >
              {addresses.map((address) => (
                <FormControlLabel
                  key={address.id}
                  value={String(address.id)}
                  control={<Radio />}
                  label={`${address.street}, ${address.number} — ${address.neighborhood}`}
                />
              ))}
              <FormControlLabel value="" control={<Radio />} label="Cadastrar outro endereço" />
            </RadioGroup>
          </FormControl>
        ) : null}

        <TextField
          fullWidth
          label="CEP"
          sx={{ mb: 1.5 }}
          value={form.postalCode}
          placeholder="00000-000"
          helperText={cepLookup.message || 'O CEP preenche rua, cidade e UF.'}
          error={cepLookup.status === 'error'}
          inputProps={{ inputMode: 'numeric', maxLength: 9 }}
          InputProps={{
            endAdornment: cepLookup.status === 'loading' ? (
              <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment>
            ) : null,
          }}
          onChange={(event) => {
            const postalCode = formatCepInput(event.target.value);
            setForm((prev) => ({
              ...emptyForm,
              postalCode,
              number: prev.number,
              complement: prev.complement,
              reference: prev.reference,
            }));
          }}
        />
        <TextField
          fullWidth
          label="Rua"
          sx={{ mb: 1.5 }}
          value={form.street}
          onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value, addressId: '' }))}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
          <TextField
            label="Número"
            value={form.number}
            onChange={(event) => setForm((prev) => ({ ...prev, number: event.target.value, addressId: '' }))}
          />
          <TextField
            label="Complemento"
            value={form.complement}
            onChange={(event) => setForm((prev) => ({ ...prev, complement: event.target.value, addressId: '' }))}
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 1.5, mb: 1.5 }}>
          <TextField
            label="Cidade"
            value={form.city}
            onChange={(event) => setForm((prev) => ({
              ...prev,
              city: event.target.value,
              neighborhoodId: '',
              addressId: '',
            }))}
          />
          <TextField
            label="UF"
            value={form.state}
            inputProps={{ maxLength: 2 }}
            onChange={(event) => setForm((prev) => ({
              ...prev,
              state: event.target.value.toUpperCase().slice(0, 2),
              neighborhoodId: '',
              addressId: '',
            }))}
          />
        </Box>
        <TextField
          select
          fullWidth
          label="Bairro"
          value={selectionStillValid(neighborhoods, form.neighborhoodId) ? String(form.neighborhoodId) : ''}
          disabled={!form.city.trim() || form.state.trim().length !== 2}
          helperText={loadingAreas
            ? 'Buscando bairros atendidos...'
            : 'Escolha o bairro onde o endereço realmente fica. Só entram bairros ativos desta loja nesta cidade.'}
          onChange={(event) => setForm((prev) => ({
            ...prev,
            neighborhoodId: event.target.value,
            addressId: '',
          }))}
          sx={{ mb: 1 }}
        >
          {neighborhoods.map((item) => (
            <MenuItem key={item.id} value={String(item.id)}>
              {item.name}
              {' · '}
              {Number(item.effectiveFee) === 0 ? 'Entrega grátis' : formatCurrency(item.effectiveFee)}
            </MenuItem>
          ))}
        </TextField>
        {selected ? (
          <Alert severity="success" sx={{ mb: 1.5 }}>
            {deliveryCoverageLabel(selected.name, selected.effectiveFee, formatCurrency)}
          </Alert>
        ) : null}
        {form.city.trim() && form.state.trim().length === 2 && !loadingAreas && neighborhoods.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Nenhum bairro ativo desta loja nesta cidade. Sem um bairro da lista, o endereço não é atendido.
          </Typography>
        ) : null}

        <Button size="small" onClick={() => setAsking((prev) => !prev)} sx={{ mb: 1 }}>
          Não encontrou seu bairro?
        </Button>
        {asking ? (
          <Box sx={{ mb: 1.5 }}>
            <TextField
              fullWidth
              required
              label="Qual é o seu bairro?"
              value={requestedName}
              onChange={(event) => setRequestedName(event.target.value)}
              sx={{ mb: 1 }}
            />
            <Button variant="outlined" onClick={sendWhatsApp}>
              Enviar solicitação pelo WhatsApp
            </Button>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              A loja vai verificar se consegue entregar nessa região. A solicitação não conclui o pedido.
            </Typography>
            {!isValidStoreWhatsApp(catalog?.phone) ? (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Esta loja ainda não tem um WhatsApp válido. Ela precisa cadastrar o telefone nas configurações. O bairro não é incluído automaticamente.
              </Alert>
            ) : null}
          </Box>
        ) : null}
        <TextField
          fullWidth
          label="Referência"
          sx={{ mb: 1.5 }}
          value={form.reference}
          onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Agora não</Button>
        <Button variant="contained" onClick={confirm} disabled={!selected}>
          Usar este endereço
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatDate, toDateInputValue } from '../../../../services/accessControl';
import {
  BRAZIL_STATES,
  CRM_BUSINESS_TYPES,
  CRM_SOURCES,
  CRM_STATUSES,
  toDateTimeLocalValue,
  fromDateTimeLocalValue,
} from '../crmConstants';

const emptyForm = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  instagram: '',
  website: '',
  businessType: 'HAMBURGER',
  address: '',
  city: '',
  state: '',
  source: 'MANUAL',
  status: 'NEW',
  firstContactAt: '',
  lastContactAt: '',
  nextContactAt: '',
  notes: '',
  phoneWhatsAppConfirmed: false,
};

function leadToForm(lead) {
  if (!lead) return { ...emptyForm };
  return {
    businessName: lead.businessName || '',
    contactName: lead.contactName || '',
    phone: lead.phone || '',
    email: lead.email || '',
    instagram: lead.instagram || '',
    website: lead.website || '',
    businessType: lead.businessType || 'OTHER',
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    source: lead.source || 'MANUAL',
    status: lead.status || 'NEW',
    firstContactAt: toDateTimeLocalValue(lead.firstContactAt),
    lastContactAt: toDateTimeLocalValue(lead.lastContactAt),
    nextContactAt: toDateTimeLocalValue(lead.nextContactAt),
    notes: lead.notes || '',
    phoneWhatsAppConfirmed: Boolean(lead.phoneWhatsAppConfirmed),
  };
}

export function CrmLeadFormDialog({ open, onClose, initialValues, onSubmit, saving, error }) {
  const [form, setForm] = useState(emptyForm);
  const dialogProps = useDialogResponsiveProps();

  useEffect(() => {
    if (!open) return;
    setForm(leadToForm(initialValues));
  }, [open, initialValues]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    const payload = {
      businessName: form.businessName.trim(),
      phone: form.phone.trim(),
      businessType: form.businessType,
      source: form.source,
      status: form.status,
    };
    if (form.contactName.trim()) payload.contactName = form.contactName.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.instagram.trim()) payload.instagram = form.instagram.trim();
    if (form.website.trim()) payload.website = form.website.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.city.trim()) payload.city = form.city.trim();
    if (form.state) payload.state = form.state;
    if (form.notes.trim()) payload.notes = form.notes.trim();
    const firstContactAt = fromDateTimeLocalValue(form.firstContactAt);
    const lastContactAt = fromDateTimeLocalValue(form.lastContactAt);
    const nextContactAt = fromDateTimeLocalValue(form.nextContactAt);
    if (firstContactAt) payload.firstContactAt = firstContactAt;
    if (lastContactAt) payload.lastContactAt = lastContactAt;
    if (nextContactAt) payload.nextContactAt = nextContactAt;
    payload.phoneWhatsAppConfirmed = Boolean(form.phoneWhatsAppConfirmed);
    onSubmit(payload);
  };

  const isEdit = Boolean(initialValues?.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" {...dialogProps}>
      <DialogTitle>{isEdit ? 'Editar lead' : 'Novo lead'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
            {error}
          </Alert>
        )}
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1.5 }}>Estabelecimento</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nome do estabelecimento" value={form.businessName} onChange={handleChange('businessName')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Segmento</InputLabel>
              <Select label="Segmento" value={form.businessType} onChange={handleChange('businessType')}>
                {CRM_BUSINESS_TYPES.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Endereço" value={form.address} onChange={handleChange('address')} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField fullWidth label="Cidade" value={form.city} onChange={handleChange('city')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select label="Estado" value={form.state} onChange={handleChange('state')}>
                <MenuItem value="">—</MenuItem>
                {BRAZIL_STATES.map((uf) => (
                  <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>Contato</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nome do responsável" value={form.contactName} onChange={handleChange('contactName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={form.phone}
              onChange={handleChange('phone')}
              required={!isEdit}
              helperText={isEdit ? 'Telefone do Google não confirma WhatsApp automaticamente.' : 'Informe DDD + número, ex.: 11999998888'}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={(
                <Switch
                  checked={Boolean(form.phoneWhatsAppConfirmed)}
                  onChange={(event) => setForm((prev) => ({ ...prev, phoneWhatsAppConfirmed: event.target.checked }))}
                />
              )}
              label="WhatsApp confirmado"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="E-mail" value={form.email} onChange={handleChange('email')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Instagram" value={form.instagram} onChange={handleChange('instagram')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Site" value={form.website} onChange={handleChange('website')} />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>Comercial</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Origem do lead</InputLabel>
              <Select label="Origem do lead" value={form.source} onChange={handleChange('source')}>
                {CRM_SOURCES.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status} onChange={handleChange('status')}>
                {CRM_STATUSES.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Primeiro contato"
              InputLabelProps={{ shrink: true }}
              value={form.firstContactAt}
              onChange={handleChange('firstContactAt')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Último contato"
              InputLabelProps={{ shrink: true }}
              value={form.lastContactAt}
              onChange={handleChange('lastContactAt')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Próximo contato / follow-up"
              InputLabelProps={{ shrink: true }}
              value={form.nextContactAt}
              onChange={handleChange('nextContactAt')}
            />
          </Grid>
        </Grid>
        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>Observações</Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Observações"
          value={form.notes}
          onChange={handleChange('notes')}
        />
        {isEdit && initialValues?.createdAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Cadastrado em {formatDate(toDateInputValue(initialValues.createdAt))}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !form.businessName.trim() || (!isEdit && !form.phone.trim())}
          sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' }, textTransform: 'none' }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

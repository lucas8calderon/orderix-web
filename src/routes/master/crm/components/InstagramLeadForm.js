import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { BRAZIL_STATES, CRM_BUSINESS_TYPES } from '../crmConstants';
import { INSTAGRAM_LEAD_KINDS } from '../instagramCrm';

const EMPTY = {
  businessName: '',
  leadKind: 'ESTABLISHMENT',
  instagram: '',
  businessType: '',
  contactName: '',
  notes: '',
  city: '',
  state: '',
};

export function InstagramLeadForm({ open, initialValues, onClose, onSubmit, saving, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (!initialValues) {
      setForm(EMPTY);
      return;
    }
    setForm({
      businessName: initialValues.businessName || '',
      leadKind: initialValues.leadKind || 'ESTABLISHMENT',
      instagram: initialValues.instagram || (initialValues.instagramUsername ? `@${initialValues.instagramUsername}` : ''),
      businessType: initialValues.businessType || '',
      contactName: initialValues.contactName || '',
      notes: initialValues.notes || '',
      city: initialValues.city || '',
      state: initialValues.state || '',
    });
  }, [open, initialValues]);

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.businessName.trim(),
      leadKind: form.leadKind,
      instagram: form.instagram.trim(),
      segment: form.businessType || null,
      contactName: form.contactName.trim(),
      notes: form.notes.trim(),
      city: form.city.trim(),
      state: form.state,
      source: 'INSTAGRAM',
      businessName: form.businessName.trim(),
      businessType: form.businessType || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle>{initialValues?.id ? 'Editar lead' : 'Novo lead do Instagram'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField required label="Nome do lead" value={form.businessName} onChange={set('businessName')} />
            <TextField select required label="Tipo de lead" value={form.leadKind} onChange={set('leadKind')}>
              {INSTAGRAM_LEAD_KINDS.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              required
              label="Instagram"
              placeholder="@perfil ou https://www.instagram.com/perfil/"
              value={form.instagram}
              onChange={set('instagram')}
            />
            <TextField select label="Segmento" value={form.businessType} onChange={set('businessType')}>
              <MenuItem value="">Não informado</MenuItem>
              {CRM_BUSINESS_TYPES.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Responsável" value={form.contactName} onChange={set('contactName')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField label="Cidade" value={form.city} onChange={set('city')} fullWidth />
              <TextField select label="UF" value={form.state} onChange={set('state')} sx={{ minWidth: 100 }}>
                <MenuItem value="">—</MenuItem>
                {BRAZIL_STATES.map((uf) => (
                  <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField label="Observações" value={form.notes} onChange={set('notes')} multiline minRows={3} />
            {error && <TextField value={error} error helperText={error} InputProps={{ readOnly: true }} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: 'none', bgcolor: '#2563EB' }}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

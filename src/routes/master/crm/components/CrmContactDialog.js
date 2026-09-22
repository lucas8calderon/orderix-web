import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { CRM_CONTACT_TYPES, fromDateTimeLocalValue, toDateTimeLocalValue } from '../crmConstants';

export function CrmContactDialog({ open, onClose, onSubmit, saving }) {
  const dialogProps = useDialogResponsiveProps();
  const [form, setForm] = useState({
    contactedAt: '',
    contactType: 'WHATSAPP',
    notes: '',
    outcome: '',
    nextContactAt: '',
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      contactedAt: toDateTimeLocalValue(new Date().toISOString()),
      contactType: 'WHATSAPP',
      notes: '',
      outcome: '',
      nextContactAt: '',
    });
  }, [open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    onSubmit({
      contactedAt: fromDateTimeLocalValue(form.contactedAt),
      contactType: form.contactType,
      notes: form.notes.trim() || undefined,
      outcome: form.outcome.trim() || undefined,
      nextContactAt: fromDateTimeLocalValue(form.nextContactAt),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" {...dialogProps}>
      <DialogTitle>Registrar contato</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Data e hora"
              InputLabelProps={{ shrink: true }}
              value={form.contactedAt}
              onChange={handleChange('contactedAt')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de contato</InputLabel>
              <Select label="Tipo de contato" value={form.contactType} onChange={handleChange('contactType')}>
                {CRM_CONTACT_TYPES.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Resultado" value={form.outcome} onChange={handleChange('outcome')} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Observação"
              value={form.notes}
              onChange={handleChange('notes')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Próximo contato"
              InputLabelProps={{ shrink: true }}
              value={form.nextContactAt}
              onChange={handleChange('nextContactAt')}
              helperText="Agende o retorno para manter o follow-up em dia."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' }, textTransform: 'none' }}
        >
          {saving ? 'Salvando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

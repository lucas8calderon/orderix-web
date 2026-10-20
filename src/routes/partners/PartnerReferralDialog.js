import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDialogResponsiveProps } from '../../commons/hooks/useResponsive';
import { PATHS } from '../../services/accessControl';
import { createPartnerReferral, getApiErrorMessage } from '../../services/partnerService';
import { formatPhoneInput, isValidBrazilianPhone } from '../../utils/phoneInput';
import { REFERRAL_SEGMENTS } from './partnerConstants';

const EMPTY_FORM = {
  establishmentName: '',
  contactName: '',
  commercialWhatsapp: '',
  segment: '',
  notes: '',
  consentToProcessData: false,
};

/** Nova indicação. `onCreated(referral)` é chamado após o sucesso. */
export default function PartnerReferralDialog({ open, onClose, onCreated }) {
  const dialogProps = useDialogResponsiveProps();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitError('');
      setLoading(false);
    }
  }, [open]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = {};
    if (!form.establishmentName.trim()) nextErrors.establishmentName = 'Informe o nome do estabelecimento.';
    if (!isValidBrazilianPhone(form.commercialWhatsapp)) {
      nextErrors.commercialWhatsapp = 'Informe o WhatsApp comercial com DDD.';
    }
    if (!form.consentToProcessData) {
      nextErrors.consentToProcessData = 'Confirme que você pode compartilhar estes dados.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');
    try {
      const referral = await createPartnerReferral(form);
      onCreated?.(referral);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Não foi possível registrar a indicação. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      aria-labelledby="partner-referral-title"
      {...dialogProps}
    >
      <DialogTitle id="partner-referral-title">Nova indicação</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Indique um estabelecimento que pode se beneficiar da Weper. A equipe acompanha o contato
            e o andamento aparece na sua lista.
          </Typography>
          {submitError && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{submitError}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="Nome do estabelecimento"
              value={form.establishmentName}
              onChange={(event) => update('establishmentName', event.target.value)}
              error={Boolean(errors.establishmentName)}
              helperText={errors.establishmentName}
              required
              fullWidth
              autoFocus
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nome do contato"
                value={form.contactName}
                onChange={(event) => update('contactName', event.target.value)}
                fullWidth
              />
              <TextField
                label="WhatsApp comercial"
                value={form.commercialWhatsapp}
                onChange={(event) => update('commercialWhatsapp', formatPhoneInput(event.target.value))}
                error={Boolean(errors.commercialWhatsapp)}
                helperText={errors.commercialWhatsapp}
                placeholder="(11) 99999-9999"
                inputProps={{ inputMode: 'tel' }}
                required
                fullWidth
              />
            </Stack>
            <Autocomplete
              freeSolo
              options={REFERRAL_SEGMENTS}
              inputValue={form.segment}
              onInputChange={(_event, value) => update('segment', value)}
              renderInput={(params) => <TextField {...params} label="Segmento (opcional)" />}
            />
            <TextField
              label="Observações (opcional)"
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              multiline
              minRows={2}
              maxRows={5}
              fullWidth
            />
            <Box>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={form.consentToProcessData}
                    onChange={(event) => update('consentToProcessData', event.target.checked)}
                  />
                )}
                label={(
                  <Typography variant="body2">
                    Confirmo que tenho autorização para compartilhar estes dados de contato com a Weper,
                    conforme a{' '}
                    <Link to={PATHS.PRIVACY} target="_blank" rel="noopener noreferrer">Política de privacidade</Link>.
                  </Typography>
                )}
                sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { pt: 0.5 } }}
              />
              {errors.consentToProcessData && <FormHelperText error>{errors.consentToProcessData}</FormHelperText>}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Enviando…' : 'Enviar indicação'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import {
  PARTNER_PASSWORD_HINT,
  changePartnerPassword,
  formatWhatsappDisplay,
  getApiErrorMessage,
  getPartnerProfile,
  isValidPartnerPassword,
  syncPartnerSessionUser,
  updatePartnerProfile,
  updatePartnerPayoutData,
} from '../../services/partnerService';
import { formatPhoneInput, isValidBrazilianPhone } from '../../utils/phoneInput';
import { formatDateTime } from './partnerConstants';
import PartnerPasswordField from './PartnerPasswordField';
import PartnerShell from './PartnerShell';
import { PartnerStatusChip } from './PartnerStatusChip';

function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    whatsapp: formatPhoneInput(formatWhatsappDisplay(profile.whatsapp)),
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const originalDigits = String(profile.whatsapp || '').replace(/\D/g, '').replace(/^55/, '');
  const whatsappChanged = form.whatsapp.replace(/\D/g, '') !== originalDigits;

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: field === 'whatsapp' ? formatPhoneInput(value) : value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'Informe seu nome.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Informe seu sobrenome.';
    if (!isValidBrazilianPhone(form.whatsapp)) nextErrors.whatsapp = 'Informe um WhatsApp com DDD.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setMessage(null);
    try {
      const updated = await updatePartnerProfile(form);
      onSaved(updated);
      setMessage({ severity: 'success', text: 'Dados atualizados.' });
    } catch (error) {
      setMessage({ severity: 'error', text: getApiErrorMessage(error, 'Não foi possível salvar os dados.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {message && <Alert severity={message.severity} role={message.severity === 'error' ? 'alert' : 'status'} sx={{ mb: 2 }}>{message.text}</Alert>}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Nome" value={form.firstName} onChange={setField('firstName')} error={Boolean(errors.firstName)} helperText={errors.firstName} fullWidth required />
          <TextField label="Sobrenome" value={form.lastName} onChange={setField('lastName')} error={Boolean(errors.lastName)} helperText={errors.lastName} fullWidth required />
        </Stack>
        <TextField label="WhatsApp" value={form.whatsapp} onChange={setField('whatsapp')} error={Boolean(errors.whatsapp)} helperText={errors.whatsapp || 'É também o seu usuário de acesso.'} inputProps={{ inputMode: 'tel' }} fullWidth required />
        {whatsappChanged && (
          <Alert severity="warning">Ao trocar o WhatsApp, seu usuário de acesso muda e o número volta a precisar de verificação.</Alert>
        )}
        <Box>
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function PayoutForm({ profile, onSaved }) {
  const [form, setForm] = useState({
    holderName: profile.payoutHolderName || '',
    document: '',
    pixKeyType: profile.pixKeyType || 'CPF',
    pixKey: '',
    currentPassword: '',
  });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updatePartnerPayoutData(form);
      onSaved(updated);
      setForm((current) => ({ ...current, pixKey: '', currentPassword: '', document: '' }));
      setMessage({ severity: 'success', text: 'Dados Pix enviados para revisão.' });
    } catch (error) {
      setMessage({ severity: 'error', text: getApiErrorMessage(error, 'Não foi possível salvar os dados Pix.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
      <Alert severity="info" sx={{ mb: 2 }}>
        Não pedimos conta Asaas nem API key. Informe titular, CPF/CNPJ e chave Pix.
        Status atual: <strong>{profile.payoutDataStatus || 'MISSING'}</strong>
        {profile.pixKeyMasked ? ` · chave ${profile.pixKeyMasked}` : ''}
      </Alert>
      {profile.payoutDataNotes && <Alert severity="warning" sx={{ mb: 2 }}>{profile.payoutDataNotes}</Alert>}
      <Stack spacing={2}>
        <TextField label="Nome do titular" value={form.holderName} onChange={(e) => setForm((c) => ({ ...c, holderName: e.target.value }))} fullWidth required />
        <TextField label="CPF/CNPJ do titular" value={form.document} onChange={(e) => setForm((c) => ({ ...c, document: e.target.value }))} helperText={profile.payoutDocumentMasked ? `Atual mascarado: ${profile.payoutDocumentMasked}` : undefined} fullWidth required />
        <FormControl fullWidth>
          <InputLabel id="pix-type">Tipo de chave Pix</InputLabel>
          <Select labelId="pix-type" label="Tipo de chave Pix" value={form.pixKeyType} onChange={(e) => setForm((c) => ({ ...c, pixKeyType: e.target.value }))}>
            {['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP'].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Chave Pix" value={form.pixKey} onChange={(e) => setForm((c) => ({ ...c, pixKey: e.target.value }))} fullWidth required />
        <PartnerPasswordField label="Senha atual (confirmação)" value={form.currentPassword} onChange={(e) => setForm((c) => ({ ...c, currentPassword: e.target.value }))} required />
        <Box>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Salvando…' : 'Salvar dados de recebimento'}</Button>
        </Box>
      </Stack>
    </Box>
  );
}

function PasswordForm() {
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!isValidPartnerPassword(form.newPassword)) {
      setMessage({ severity: 'error', text: PARTNER_PASSWORD_HINT });
      return;
    }
    setSaving(true);
    try {
      await changePartnerPassword(form);
      setForm(empty);
      setMessage({ severity: 'success', text: 'Senha alterada.' });
    } catch (error) {
      setMessage({ severity: 'error', text: getApiErrorMessage(error, 'Não foi possível alterar a senha.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
      <Stack spacing={2}>
        <PartnerPasswordField label="Senha atual" value={form.currentPassword} onChange={(e) => setForm((c) => ({ ...c, currentPassword: e.target.value }))} required />
        <PartnerPasswordField label="Nova senha" value={form.newPassword} onChange={(e) => setForm((c) => ({ ...c, newPassword: e.target.value }))} helperText={PARTNER_PASSWORD_HINT} required />
        <PartnerPasswordField label="Confirmar nova senha" value={form.confirmPassword} onChange={(e) => setForm((c) => ({ ...c, confirmPassword: e.target.value }))} required />
        <Box><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Salvando…' : 'Alterar senha'}</Button></Box>
      </Stack>
    </Box>
  );
}

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getPartnerProfile()
      .then((data) => {
        setProfile(data);
        syncPartnerSessionUser(data);
      })
      .catch((failure) => setError(getApiErrorMessage(failure, 'Não foi possível carregar o perfil.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <PartnerShell>
      <div className="partner-page-head">
        <div>
          <h1 className="partner-page-title">Meu perfil</h1>
          <p className="partner-page-subtitle">Dados pessoais, recebimentos Pix e segurança.</p>
        </div>
        <Button component={Link} to={PATHS.PARTNERS_DASHBOARD} variant="outlined">Voltar ao painel</Button>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Tentar novamente</Button>}>{error}</Alert>}
      {loading && <div className="partner-stack" aria-busy="true"><Skeleton variant="rounded" height={110} /><Skeleton variant="rounded" height={260} /></div>}

      {!loading && profile && (
        <div className="partner-stack">
          <section className="partner-card">
            <h2 className="partner-card-title">Sua conta</h2>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 4 }} sx={{ mt: 1.5 }}>
              <Box><Typography variant="caption" color="text.secondary">Situação</Typography><Box sx={{ mt: 0.5 }}><PartnerStatusChip kind="partner" value={profile.status} /></Box></Box>
              <Box><Typography variant="caption" color="text.secondary">Código</Typography><Typography fontWeight={600}>{profile.referralCode || '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Desde</Typography><Typography fontWeight={600}>{formatDateTime(profile.createdAt)}</Typography></Box>
            </Stack>
          </section>
          <section className="partner-card"><h2 className="partner-card-title">Dados pessoais</h2><ProfileForm profile={profile} onSaved={setProfile} /></section>
          <section className="partner-card"><h2 className="partner-card-title">Meus dados de recebimento</h2><PayoutForm profile={profile} onSaved={setProfile} /></section>
          <section className="partner-card"><h2 className="partner-card-title">Segurança</h2><PasswordForm /></section>
        </div>
      )}
    </PartnerShell>
  );
}

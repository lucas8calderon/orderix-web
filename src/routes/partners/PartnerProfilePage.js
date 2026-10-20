import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Skeleton, Stack, TextField, Typography } from '@mui/material';
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
          <TextField
            label="Nome"
            value={form.firstName}
            onChange={setField('firstName')}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            fullWidth
            required
          />
          <TextField
            label="Sobrenome"
            value={form.lastName}
            onChange={setField('lastName')}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            fullWidth
            required
          />
        </Stack>
        <TextField
          label="WhatsApp"
          value={form.whatsapp}
          onChange={setField('whatsapp')}
          error={Boolean(errors.whatsapp)}
          helperText={errors.whatsapp || 'É também o seu usuário de acesso.'}
          inputProps={{ inputMode: 'tel' }}
          fullWidth
          required
        />
        {whatsappChanged && (
          <Alert severity="warning">
            Ao trocar o WhatsApp, seu usuário de acesso muda e o número volta a precisar de verificação.
          </Alert>
        )}
        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function PasswordForm() {
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = 'Informe a senha atual.';
    if (!isValidPartnerPassword(form.newPassword)) nextErrors.newPassword = PARTNER_PASSWORD_HINT;
    if (!form.confirmPassword || form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = 'A confirmação de senha não confere.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setMessage(null);
    try {
      await changePartnerPassword(form);
      setForm(empty);
      setMessage({ severity: 'success', text: 'Senha alterada com sucesso.' });
    } catch (error) {
      setMessage({ severity: 'error', text: getApiErrorMessage(error, 'Não foi possível alterar a senha.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {message && <Alert severity={message.severity} role={message.severity === 'error' ? 'alert' : 'status'} sx={{ mb: 2 }}>{message.text}</Alert>}
      <Stack spacing={2}>
        <PartnerPasswordField
          label="Senha atual"
          value={form.currentPassword}
          onChange={setField('currentPassword')}
          error={Boolean(errors.currentPassword)}
          helperText={errors.currentPassword}
          autoComplete="current-password"
        />
        <PartnerPasswordField
          label="Nova senha"
          value={form.newPassword}
          onChange={setField('newPassword')}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword || PARTNER_PASSWORD_HINT}
          autoComplete="new-password"
        />
        <PartnerPasswordField
          label="Confirmar nova senha"
          value={form.confirmPassword}
          onChange={setField('confirmPassword')}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Box>
          <Button
            type="submit"
            variant="outlined"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Alterando…' : 'Alterar senha'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPartnerProfile();
      setProfile(data);
      syncPartnerSessionUser(data);
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Não foi possível carregar seu perfil.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Meu perfil | Parceiros Weper';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <PartnerShell maxWidth={900}>
      <div className="partner-page-head">
        <div>
          <h1 className="partner-page-title">Meu perfil</h1>
          <p className="partner-page-subtitle">Seus dados de acesso e de contato na Área de Parceiros.</p>
        </div>
        <Button component={Link} to={PATHS.PARTNERS_DASHBOARD} variant="outlined">Voltar ao painel</Button>
      </div>

      {error && (
        <Alert
          severity="error"
          role="alert"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={load}>Tentar novamente</Button>}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <div className="partner-stack" aria-busy="true" aria-label="Carregando perfil">
          <Skeleton variant="rounded" height={110} />
          <Skeleton variant="rounded" height={260} />
        </div>
      )}

      {!loading && profile && (
        <div className="partner-stack">
          <section className="partner-card" aria-labelledby="partner-account-title">
            <h2 id="partner-account-title" className="partner-card-title">Sua conta</h2>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 4 }} sx={{ mt: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Situação</Typography>
                <Box sx={{ mt: 0.5 }}><PartnerStatusChip kind="partner" value={profile.status} /></Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
                <Typography fontWeight={600}>
                  {formatWhatsappDisplay(profile.whatsapp)}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {profile.phoneVerified ? '· verificado' : '· verificação pendente'}
                  </Typography>
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Código de indicação</Typography>
                <Typography fontWeight={600}>{profile.referralCode || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Parceiro desde</Typography>
                <Typography fontWeight={600}>{formatDateTime(profile.createdAt)}</Typography>
              </Box>
            </Stack>
            {!profile.phoneVerified && (
              <Alert severity="info" sx={{ mt: 2 }}>
                A verificação do WhatsApp será solicitada quando estiver disponível. Até lá, algumas
                funcionalidades sensíveis podem ficar limitadas.
              </Alert>
            )}
          </section>

          <section className="partner-card" aria-labelledby="partner-data-title">
            <h2 id="partner-data-title" className="partner-card-title">Dados pessoais</h2>
            <p className="partner-card-subtitle">Mantenha seu nome e WhatsApp atualizados.</p>
            <ProfileForm profile={profile} onSaved={(updated) => setProfile(updated)} />
          </section>

          <section className="partner-card" aria-labelledby="partner-password-title">
            <h2 id="partner-password-title" className="partner-card-title">Segurança</h2>
            <p className="partner-card-subtitle">Altere a senha de acesso à Área de Parceiros.</p>
            <PasswordForm />
          </section>
        </div>
      )}
    </PartnerShell>
  );
}

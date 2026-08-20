import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import {
  PLAN_LABELS,
  PLANS,
  SUBSCRIPTION_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from '../../services/accessControl';
import { useMasterStores } from './hook/useMasterStores';
import { createStore, updateStore } from './service/storesService';
import { MasterOverview, statusColor } from './components/MasterOverview';

const emptyForm = {
  name: '',
  responsibleName: '',
  phone: '',
  email: '',
  adminEmail: '',
  adminPassword: '',
  plan: 'PRO',
  price: PLANS.PRO.price,
  subscriptionStatus: 'ACTIVE',
  startDate: '',
  expiresAt: '',
};

function StoreFormDialog({ open, onClose, initialValues, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);

  React.useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setForm({
        name: initialValues.name || '',
        responsibleName: initialValues.responsibleName || initialValues.adminName || '',
        phone: initialValues.phone || '',
        email: initialValues.email || '',
        adminEmail: initialValues.adminEmail || '',
        adminPassword: '',
        plan: initialValues.plan || 'BASIC',
        price: initialValues.price ?? PLANS[initialValues.plan || 'BASIC']?.price ?? 49.9,
        subscriptionStatus: initialValues.subscriptionStatus || 'ACTIVE',
        startDate: initialValues.startDate || '',
        expiresAt: initialValues.expiresAt || '',
      });
    } else {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setForm({
        ...emptyForm,
        startDate: today.toISOString().slice(0, 10),
        expiresAt: nextMonth.toISOString().slice(0, 10),
      });
    }
  }, [open, initialValues]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'plan' && PLANS[value]) {
        next.price = PLANS[value].price;
      }
      return next;
    });
  };

  const handleSave = () => {
    onSubmit(form);
  };

  const isEdit = Boolean(initialValues?.id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar loja' : 'Cadastrar loja'}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1.5 }}>
          Informações da loja
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nome da loja" value={form.name} onChange={handleChange('name')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nome do responsável" value={form.responsibleName} onChange={handleChange('responsibleName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telefone" value={form.phone} onChange={handleChange('phone')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="E-mail da loja" value={form.email} onChange={handleChange('email')} />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
          Credenciais de acesso
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="E-mail de acesso"
              value={form.adminEmail}
              onChange={handleChange('adminEmail')}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="password"
              label={isEdit ? 'Nova senha (opcional)' : 'Senha'}
              value={form.adminPassword}
              onChange={handleChange('adminPassword')}
              required={!isEdit}
              helperText={isEdit ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
          Assinatura
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="plan-label">Plano</InputLabel>
              <Select labelId="plan-label" label="Plano" value={form.plan} onChange={handleChange('plan')}>
                {Object.values(PLANS).map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.label} — {formatCurrency(plan.price)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Valor mensal"
              value={form.price}
              onChange={handleChange('price')}
              inputProps={{ step: '0.01', min: '0' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status da assinatura</InputLabel>
              <Select
                labelId="status-label"
                label="Status da assinatura"
                value={form.subscriptionStatus}
                onChange={handleChange('subscriptionStatus')}
              >
                {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Data de início"
              value={form.startDate}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Data de vencimento"
              value={form.expiresAt}
              onChange={handleChange('expiresAt')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ backgroundColor: '#0A6847', '&:hover': { backgroundColor: '#085538' } }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MasterDashboard() {
  const navigate = useNavigate();
  const { stores, summary, loading, error, refetch } = useMasterStores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [screen, setScreen] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openCreate = () => {
    setEditingStore(null);
    setDialogOpen(true);
  };

  const openEdit = (store) => {
    setEditingStore(store);
    setDialogOpen(true);
  };

  const handleSubmit = async (form) => {
    if (!form.name?.trim() || !form.adminEmail?.trim()) {
      setToast({ open: true, message: 'Informe nome da loja e e-mail de acesso.', severity: 'error' });
      return;
    }
    if (!editingStore && (!form.adminPassword || form.adminPassword.length < 6)) {
      setToast({ open: true, message: 'Informe uma senha com ao menos 6 caracteres.', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        responsibleName: form.responsibleName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        adminName: form.responsibleName?.trim() || form.name.trim(),
        adminEmail: form.adminEmail.trim(),
        plan: form.plan,
        price: Number(form.price),
        subscriptionStatus: form.subscriptionStatus,
        startDate: form.startDate || undefined,
        expiresAt: form.expiresAt || undefined,
      };
      if (form.adminPassword) {
        payload.adminPassword = form.adminPassword;
      }

      if (editingStore?.id) {
        await updateStore(editingStore.id, payload);
        setToast({ open: true, message: 'Loja atualizada com sucesso.', severity: 'success' });
      } else {
        await createStore(payload);
        setToast({ open: true, message: 'Loja cadastrada com sucesso.', severity: 'success' });
      }
      setDialogOpen(false);
      await refetch();
      setScreen('stores');
    } catch (err) {
      const message = err?.response?.data?.message || 'Não foi possível salvar a loja.';
      setToast({ open: true, message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7f6' }}>
      <Box
        sx={{
          bgcolor: '#0A6847',
          color: '#fff',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Orderix Master
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Gestão administrativa da plataforma
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button
            color="inherit"
            onClick={() => setScreen('dashboard')}
            sx={{
              textTransform: 'none',
              fontWeight: screen === 'dashboard' ? 700 : 400,
              borderBottom: screen === 'dashboard' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => setScreen('stores')}
            sx={{
              textTransform: 'none',
              fontWeight: screen === 'stores' ? 700 : 400,
              borderBottom: screen === 'stores' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Lojas
          </Button>
          <Button color="inherit" onClick={handleLogout} sx={{ textTransform: 'none' }}>
            Sair
          </Button>
        </Stack>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#0A6847' }} />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Não foi possível carregar os dados administrativos.
          </Alert>
        )}

        {!loading && !error && screen === 'dashboard' && (
          <MasterOverview
            summary={summary}
            stores={stores}
            onViewAllStores={() => setScreen('stores')}
          />
        )}

        {!loading && !error && screen === 'stores' && (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Lojas
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{
                  backgroundColor: '#0A6847',
                  '&:hover': { backgroundColor: '#085538' },
                  textTransform: 'none',
                }}
              >
                Cadastrar Loja
              </Button>
            </Stack>

            <Paper
              elevation={0}
              sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'auto' }}
            >
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Loja</TableCell>
                    <TableCell>Responsável</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id} hover>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.responsibleName || store.adminName || '—'}</TableCell>
                      <TableCell>{PLAN_LABELS[store.plan] || store.plan || '—'}</TableCell>
                      <TableCell>{formatCurrency(store.price)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            SUBSCRIPTION_STATUS_LABELS[store.subscriptionStatus]
                            || store.subscriptionStatus
                            || '—'
                          }
                          color={statusColor(store.subscriptionStatus)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(store.expiresAt)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(store)} sx={{ textTransform: 'none' }}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {stores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        Nenhuma loja cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </Container>

      <StoreFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValues={editingStore}
        onSubmit={handleSubmit}
        saving={saving}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

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
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import { logout } from '../../services/authService';
import {
  PATHS,
  PLAN_LABELS,
  PLANS,
  SUBSCRIPTION_STATUS_LABELS,
  formatCurrency,
  formatDate,
  getPostLoginPath,
  toDateInputValue,
} from '../../services/accessControl';
import { useMasterStores } from './hook/useMasterStores';
import { createStore, updateStore } from './service/storesService';
import { MasterOverview, statusColor } from './components/MasterOverview';
import { MasterPlans } from './components/MasterPlans';
import { MasterSubscriptions } from './components/MasterSubscriptions';
import { CrmBoard } from './crm/CrmBoard';
import { useDialogResponsiveProps } from '../../commons/hooks/useResponsive';
import { getCurrentUser } from '../../services/session';

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
  const dialogProps = useDialogResponsiveProps();

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
        startDate: toDateInputValue(initialValues.startDate),
        expiresAt: toDateInputValue(initialValues.expiresAt),
      });
    } else {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setForm({
        ...emptyForm,
        startDate: toDateInputValue(today),
        expiresAt: toDateInputValue(nextMonth),
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
    <Dialog open={open} onClose={onClose} maxWidth="md" {...dialogProps}>
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
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' } }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const ADMIN_SECTIONS = {
  dashboard: PATHS.ADMIN_DASHBOARD,
  restaurantes: PATHS.ADMIN_RESTAURANTES,
  planos: PATHS.ADMIN_PLANOS,
  assinaturas: PATHS.ADMIN_ASSINATURAS,
  crm: PATHS.ADMIN_CRM,
};

export default function MasterDashboard() {
  const navigate = useNavigate();
  const { section } = useParams();
  const user = getCurrentUser();
  const { stores, summary, loading, error, refetch } = useMasterStores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  const goToSection = (slug) => {
    const path = ADMIN_SECTIONS[slug];
    if (path) {
      navigate(path);
    }
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
      navigate(PATHS.ADMIN_RESTAURANTES);
    } catch (err) {
      const message = err?.response?.data?.message || 'Não foi possível salvar a loja.';
      setToast({ open: true, message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!section || !ADMIN_SECTIONS[section]) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg)' }}>
      <Box
        sx={{
          bgcolor: 'var(--color-sidebar)',
          color: 'var(--color-sidebar-text)',
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-sidebar-brand)' }}>
            Weper Master
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Gestão administrativa da plataforma
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <ThemeToggleButton className="header-theme-toggle" />
          <Button
            color="inherit"
            onClick={() => goToSection('dashboard')}
            sx={{
              textTransform: 'none',
              fontWeight: section === 'dashboard' ? 700 : 400,
              borderBottom: section === 'dashboard' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => goToSection('restaurantes')}
            sx={{
              textTransform: 'none',
              fontWeight: section === 'restaurantes' ? 700 : 400,
              borderBottom: section === 'restaurantes' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Restaurantes
          </Button>
          <Button
            color="inherit"
            onClick={() => goToSection('planos')}
            sx={{
              textTransform: 'none',
              fontWeight: section === 'planos' ? 700 : 400,
              borderBottom: section === 'planos' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Planos
          </Button>
          <Button
            color="inherit"
            onClick={() => goToSection('assinaturas')}
            sx={{
              textTransform: 'none',
              fontWeight: section === 'assinaturas' ? 700 : 400,
              borderBottom: section === 'assinaturas' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Assinaturas
          </Button>
          <Button
            color="inherit"
            onClick={() => goToSection('crm')}
            sx={{
              textTransform: 'none',
              fontWeight: section === 'crm' ? 700 : 400,
              borderBottom: section === 'crm' ? '2px solid #fff' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            CRM
          </Button>
          <Button color="inherit" onClick={handleLogout} sx={{ textTransform: 'none' }}>
            Sair
          </Button>
        </Stack>
      </Box>

      <Container
        maxWidth={section === 'crm' ? false : 'lg'}
        sx={{
          py: section === 'crm' ? { xs: 2, md: 2 } : 4,
          px: section === 'crm' ? { xs: 1.5, md: 2 } : undefined,
          ...(section === 'crm' ? {
            height: { md: 'calc(100vh - 88px)' },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
            overflow: { md: 'hidden' },
          } : {}),
        }}
      >
        {section === 'crm' ? (
          <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CrmBoard />
          </Box>
        ) : (
          <>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Não foi possível carregar os dados administrativos.
          </Alert>
        )}

        {!loading && !error && section === 'dashboard' && (
          <MasterOverview
            summary={summary}
            stores={stores}
            onViewAllStores={() => goToSection('restaurantes')}
          />
        )}

        {!loading && !error && section === 'planos' && (
          <MasterPlans stores={stores} />
        )}

        {!loading && !error && section === 'assinaturas' && (
          <MasterSubscriptions stores={stores} />
        )}

        {!loading && !error && section === 'restaurantes' && (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Restaurantes
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{
                  backgroundColor: 'var(--color-primary)',
                  '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: 44,
                }}
              >
                Cadastrar Loja
              </Button>
            </Stack>

            <Paper
              elevation={0}
              sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
            >
              <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
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
                      <TableCell sx={{ wordBreak: 'break-word' }}>{store.name}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>{store.responsibleName || store.adminName || '—'}</TableCell>
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
              </Box>

              <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, p: 1.5 }}>
                {stores.length === 0 && (
                  <Typography align="center" sx={{ py: 4 }} color="text.secondary">
                    Nenhuma loja cadastrada.
                  </Typography>
                )}
                {stores.map((store) => (
                  <Paper
                    key={store.id}
                    elevation={0}
                    sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                        <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                          {store.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={
                            SUBSCRIPTION_STATUS_LABELS[store.subscriptionStatus]
                            || store.subscriptionStatus
                            || '—'
                          }
                          color={statusColor(store.subscriptionStatus)}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                        {store.responsibleName || store.adminName || '—'}
                      </Typography>
                      <Typography variant="body2">
                        {PLAN_LABELS[store.plan] || store.plan || '—'} · {formatCurrency(store.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Vencimento: {formatDate(store.expiresAt)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => openEdit(store)}
                        sx={{ textTransform: 'none', alignSelf: 'flex-start', minHeight: 40 }}
                      >
                        Editar
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </>
        )}
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

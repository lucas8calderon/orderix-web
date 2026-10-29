import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '../../../commons/components/PageHeader';
import { CrmLostReasonDialog } from './components/CrmLostReasonDialog';
import { InstagramKanban } from './components/InstagramKanban';
import { InstagramLeadDrawer } from './components/InstagramLeadDrawer';
import { InstagramLeadForm } from './components/InstagramLeadForm';
import { InstagramColumnJump, InstagramTemplatesDialog } from './components/InstagramTemplatesDialog';
import {
  INSTAGRAM_LEAD_KINDS,
  columnOf,
  compareUrgency,
  isOverdue,
  withinCreatedRange,
} from './instagramCrm';
import {
  addInstagramLeadNote,
  createCrmLead,
  getCrmLead,
  getCrmLeadActivities,
  getCrmLeads,
  getInstagramFollowUpSettings,
  getInstagramLeadMessage,
  getInstagramMessageTemplates,
  moveInstagramLead,
  registerInstagramTouch,
  restoreInstagramMessageTemplate,
  saveInstagramLeadMessage,
  updateInstagramFollowUpSettings,
  updateInstagramLeadProfile,
  updateInstagramMessageTemplate,
} from './service/crmService';
import './CrmBoard.css';

export function CrmBoard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', kind: '', status: '', overdue: false, from: '', to: '' });
  const [urgentFirst, setUrgentFirst] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [lostDialog, setLostDialog] = useState({ open: false, leadId: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (messageText, severity = 'success') => setToast({ open: true, message: messageText, severity });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCrmLeads({ channel: 'INSTAGRAM' });
      setLeads(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar o CRM.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    getInstagramFollowUpSettings().then((response) => setSettings(response.data)).catch(() => {});
  }, [load]);

  const metrics = useMemo(() => {
    const rows = leads;
    return {
      total: rows.length,
      fresh: rows.filter((lead) => columnOf(lead.status) === 'NEW').length,
      overdue: rows.filter(isOverdue).length,
      negotiating: rows.filter((lead) => columnOf(lead.status) === 'NEGOTIATING').length,
      won: rows.filter((lead) => columnOf(lead.status) === 'WON').length,
    };
  }, [leads]);

  const visible = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    return leads
      .filter((lead) => !filters.kind || lead.leadKind === filters.kind)
      .filter((lead) => !filters.status || columnOf(lead.status) === filters.status)
      .filter((lead) => !filters.overdue || isOverdue(lead))
      .filter((lead) => withinCreatedRange(lead, filters.from, filters.to))
      .filter((lead) => {
        if (!query) return true;
        const name = (lead.businessName || '').toLowerCase();
        const handle = (lead.instagramUsername || '').toLowerCase();
        return name.includes(query) || handle.includes(query);
      })
      .sort(urgentFirst ? compareUrgency : (a, b) => (b.id || 0) - (a.id || 0));
  }, [leads, filters, urgentFirst]);

  const refreshDetails = async (lead) => {
    setDetails(lead);
    setLoadingDetails(true);
    try {
      const [fullResponse, messageResponse, activityResponse] = await Promise.all([
        getCrmLead(lead.id),
        getInstagramLeadMessage(lead.id),
        getCrmLeadActivities(lead.id),
      ]);
      setDetails({ ...lead, ...(fullResponse.data || {}) });
      setMessage(messageResponse.data);
      setActivities(activityResponse.data || []);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível abrir o lead.', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const openLead = async (lead) => {
    const current = leads.find((item) => item.id === lead.id) || lead;
    await refreshDetails(current);
  };

  const applyLead = (updated) => {
    if (!updated?.id) return;
    setLeads((prev) => {
      const exists = prev.some((item) => item.id === updated.id);
      if (!exists) return [updated, ...prev];
      return prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
    });
    if (details?.id === updated.id) {
      refreshDetails(updated);
    }
  };

  const handleCreateOrEdit = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing?.id) {
        const response = await updateInstagramLeadProfile(editing.id, payload);
        applyLead(response.data);
        showToast('Lead atualizado.');
      } else {
        const response = await createCrmLead({
          businessName: payload.businessName,
          leadKind: payload.leadKind,
          instagram: payload.instagram,
          businessType: payload.businessType,
          contactName: payload.contactName,
          notes: payload.notes,
          city: payload.city,
          state: payload.state,
          source: 'INSTAGRAM',
        });
        applyLead(response.data);
        showToast('Lead cadastrado em Novo Lead.');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      const messageText = err?.response?.data?.message || 'Não foi possível salvar o lead.';
      setFormError(messageText);
    } finally {
      setSaving(false);
    }
  };

  const requestStatus = (leadId, status) => {
    if (status === 'LOST') {
      setLostDialog({ open: true, leadId });
      return;
    }
    changeStatus(leadId, status);
  };

  const changeStatus = async (leadId, status, extras = {}) => {
    setSaving(true);
    try {
      const response = await moveInstagramLead(leadId, { status, ...extras });
      applyLead(response.data);
      showToast('Etapa atualizada.');
      setLostDialog({ open: false, leadId: null });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível mover o lead.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openTemplates = async () => {
    setTemplatesOpen(true);
    try {
      const [templateResponse, settingsResponse] = await Promise.all([
        getInstagramMessageTemplates(),
        getInstagramFollowUpSettings(),
      ]);
      setTemplates(templateResponse.data || []);
      setSettings(settingsResponse.data);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível carregar os modelos.', 'error');
    }
  };

  return (
    <Box className="crm-board">
      <PageHeader
        title="CRM Instagram"
        description="Prospecção manual. O envio no Direct continua com você."
        actions={(
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={openTemplates} sx={{ textTransform: 'none' }}>Templates</Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { setEditing(null); setFormError(''); setFormOpen(true); }}
              sx={{ textTransform: 'none' }}
            >
              Cadastrar lead
            </Button>
          </Stack>
        )}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} className="ig-metrics">
        <Metric label="Leads" value={metrics.total} />
        <Metric label="Novos" value={metrics.fresh} />
        <Metric label="Follow-ups pendentes" value={metrics.overdue} highlight={metrics.overdue > 0} />
        <Metric label="Em negociação" value={metrics.negotiating} />
        <Metric label="Convertidos" value={metrics.won} />
      </Stack>

      <Box className="ig-filters">
        <TextField
          size="small"
          label="Nome ou Instagram"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />
        <TextField
          select
          size="small"
          label="Tipo"
          value={filters.kind}
          onChange={(event) => setFilters((prev) => ({ ...prev, kind: event.target.value }))}
        >
          <MenuItem value="">Todos</MenuItem>
          {INSTAGRAM_LEAD_KINDS.map((item) => <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>)}
        </TextField>
        <TextField
          select
          size="small"
          label="Etapa"
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="NEW">Novo Lead</MenuItem>
          <MenuItem value="CONTACTED">Contatado</MenuItem>
          <MenuItem value="WAITING_RESPONSE">Aguardando Retorno</MenuItem>
          <MenuItem value="NEGOTIATING">Em Negociação</MenuItem>
          <MenuItem value="WON">Convertido</MenuItem>
          <MenuItem value="NO_RESPONSE">Sem Resposta</MenuItem>
          <MenuItem value="LOST">Descartado</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Prazo"
          value={filters.overdue ? 'overdue' : ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, overdue: event.target.value === 'overdue' }))}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="overdue">Follow-up vencido</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Cadastro de"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
        />
        <TextField
          size="small"
          label="Cadastro até"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
        />
        <Button className="ig-sort" onClick={() => setUrgentFirst((prev) => !prev)}>
          {urgentFirst ? 'Mais urgentes primeiro' : 'Ordem recente'}
        </Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && leads.length === 0 && (
        <Alert severity="info">Nenhum lead de Instagram ainda. Cadastre um perfil para começar a prospecção.</Alert>
      )}
      {!loading && !error && leads.length > 0 && visible.length === 0 && (
        <Alert severity="info">Nenhum lead com esses filtros.</Alert>
      )}
      {!loading && !error && visible.length > 0 && (
        <Box className="crm-board-main">
          <InstagramColumnJump onJump={(id) => document.getElementById(`ig-column-${id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'start' })} />
          <InstagramKanban leads={visible} onOpen={openLead} onChangeStatus={requestStatus} />
        </Box>
      )}

      <InstagramLeadForm
        open={formOpen}
        initialValues={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrEdit}
        saving={saving}
        error={formError}
      />
      <InstagramLeadDrawer
        open={Boolean(details)}
        lead={details}
        message={message}
        activities={activities}
        loading={loadingDetails}
        saving={saving}
        settings={settings}
        onClose={() => setDetails(null)}
        onEdit={() => { setEditing(details); setFormError(''); setFormOpen(true); }}
        onChangeStatus={requestStatus}
        onCopy={async (text) => {
          try {
            await navigator.clipboard.writeText(text || '');
            showToast('Mensagem copiada. O envio continua manual.');
          } catch (err) {
            showToast('Não foi possível copiar a mensagem.', 'error');
          }
        }}
        onOpenInstagram={() => {
          const url = details?.instagramProfileUrl || details?.instagram;
          if (!url) return;
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        onRegister={async (id) => {
          setSaving(true);
          try {
            const response = await registerInstagramTouch(id);
            applyLead(response.data);
            showToast('Contato registrado.');
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível registrar o contato.', 'error');
          } finally {
            setSaving(false);
          }
        }}
        onSaveMessage={async (id, content) => {
          setSaving(true);
          try {
            const response = await saveInstagramLeadMessage(id, content);
            setMessage(response.data);
            showToast('Texto salvo só neste lead.');
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível salvar o texto.', 'error');
          } finally {
            setSaving(false);
          }
        }}
        onAddNote={async (id, content) => {
          setSaving(true);
          try {
            const response = await addInstagramLeadNote(id, content);
            applyLead(response.data);
            showToast('Observação registrada.');
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível registrar a observação.', 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
      <InstagramTemplatesDialog
        open={templatesOpen}
        templates={templates}
        settings={settings}
        saving={saving}
        onClose={() => setTemplatesOpen(false)}
        onSave={async (id, content) => {
          setSaving(true);
          try {
            const response = await updateInstagramMessageTemplate(id, content);
            setTemplates((prev) => prev.map((item) => (item.id === id ? response.data : item)));
            showToast('Modelo atualizado.');
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível salvar o modelo.', 'error');
          } finally {
            setSaving(false);
          }
        }}
        onRestore={async (id) => {
          setSaving(true);
          try {
            const response = await restoreInstagramMessageTemplate(id);
            setTemplates((prev) => prev.map((item) => (item.id === id ? response.data : item)));
            showToast('Texto padrão restaurado.');
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível restaurar o modelo.', 'error');
          } finally {
            setSaving(false);
          }
        }}
        onSaveSettings={async (payload) => {
          setSaving(true);
          try {
            const response = await updateInstagramFollowUpSettings(payload);
            setSettings(response.data);
            showToast('Prazos atualizados.');
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível salvar os prazos.', 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
      <CrmLostReasonDialog
        open={lostDialog.open}
        saving={saving}
        onClose={() => setLostDialog({ open: false, leadId: null })}
        onConfirm={({ lostReason, reason }) => changeStatus(lostDialog.leadId, 'LOST', { lostReason, reason })}
      />
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <Box className="ig-metric">
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: highlight ? 'error.main' : 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

import { CrmWhatsAppPanel } from './components/CrmWhatsAppPanel';
import { CrmOutreachPanel } from './components/CrmOutreachPanel';
import { PageHeader } from '../../../commons/components/PageHeader';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useCrmLeads } from './hook/useCrmLeads';
import { CrmMetrics } from './components/CrmMetrics';
import { CrmActionCenter } from './components/CrmActionCenter';
import { CrmFilters } from './components/CrmFilters';
import { CrmKanban } from './components/CrmKanban';
import { CrmStatusChart } from './components/CrmStatusChart';
import { CrmLeadList } from './components/CrmLeadList';
import { CrmLeadFormDialog } from './components/CrmLeadFormDialog';
import { CrmLeadDetailsDialog } from './components/CrmLeadDetailsDialog';
import { CrmContactDialog } from './components/CrmContactDialog';
import { CrmLostReasonDialog } from './components/CrmLostReasonDialog';
import { CrmProspectingDialog } from './components/CrmProspectingDialog';
import { getCrmLead } from './service/crmService';
import './CrmBoard.css';

function statusToast(status) {
  if (status === 'WON') return 'Lead marcado como ganho.';
  if (status === 'LOST') return 'Lead marcado como perdido.';
  if (status === 'DEMO') return 'Demonstração registrada.';
  if (status === 'PROPOSAL') return 'Proposta registrada.';
  if (status === 'INTERESTED') return 'Lead marcado como interessado (ação em 4h).';
  return 'Status atualizado.';
}

export function CrmBoard() {
  const crm = useCrmLeads();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [detailsLead, setDetailsLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [prospectingOpen, setProspectingOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [lostDialog, setLostDialog] = useState({ open: false, leadId: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const openCreate = () => {
    setEditingLead(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setFormError('');
    setFormOpen(true);
  };

  const loadDetails = useCallback(async (lead) => {
    setDetailsLead(lead);
    setLoadingActivities(true);
    try {
      const items = await crm.loadActivities(lead.id);
      setActivities(items);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível carregar o histórico.', 'error');
    } finally {
      setLoadingActivities(false);
    }
  }, [crm]);

  const refreshDetails = async (lead) => {
    setDetailsLead(lead);
    try {
      const items = await crm.loadActivities(lead.id);
      setActivities(items);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível atualizar o histórico.', 'error');
    }
  };

  const handleSaveLead = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      if (editingLead?.id) {
        const updated = await crm.updateLead(editingLead.id, payload);
        showToast('Lead atualizado.');
        setFormOpen(false);
        if (detailsLead?.id === updated.id) {
          await refreshDetails(updated);
        }
      } else {
        await crm.createLead(payload);
        showToast('Lead cadastrado.');
        setFormOpen(false);
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Não foi possível salvar o lead.';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (leadOrId, status, extras = {}) => {
    const id = typeof leadOrId === 'object' ? leadOrId?.id : leadOrId;
    if (!id || !status) return;
    if (status === 'LOST' && !extras.lostReason) {
      setLostDialog({ open: true, leadId: id });
      return;
    }
    try {
      const updated = await crm.changeStatus(id, status, extras);
      showToast(statusToast(status));
      if (detailsLead?.id === id) {
        await refreshDetails(updated);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível alterar o status.', 'error');
    }
  };

  const handleLostConfirm = async ({ lostReason, reason }) => {
    const id = lostDialog.leadId;
    if (!id || !lostReason) return;
    setSaving(true);
    try {
      const updated = await crm.changeStatus(id, 'LOST', { lostReason, reason });
      setLostDialog({ open: false, leadId: null });
      showToast(statusToast('LOST'));
      if (detailsLead?.id === id) {
        await refreshDetails(updated);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível marcar como perdido.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSend = async (lead) => {
    const target = lead || detailsLead;
    if (!target?.id) return;
    setSaving(true);
    try {
      const updated = await crm.confirmSend(target.id);
      showToast('Envio confirmado. Próxima ação em 48h.');
      if (detailsLead?.id === target.id) {
        await refreshDetails(updated);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível confirmar o envio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openContact = (lead) => {
    if (lead) setDetailsLead(lead);
    setContactOpen(true);
  };

  const handleRegisterContact = async (payload) => {
    const lead = detailsLead;
    if (!lead) return;
    setSaving(true);
    try {
      const updated = await crm.registerContact(lead.id, payload);
      showToast('Contato registrado.');
      setContactOpen(false);
      await refreshDetails(updated);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível registrar o contato.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (lead) => {
    const target = lead || detailsLead;
    if (!target) return;
    setSaving(true);
    try {
      await crm.archiveLead(target.id);
      showToast('Lead arquivado.');
      if (detailsLead?.id === target.id) {
        setDetailsLead(null);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Não foi possível arquivar o lead.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasFilters = Boolean(
    crm.filters.q
    || crm.filters.status
    || crm.filters.businessType
    || crm.filters.city
    || crm.filters.source
    || crm.filters.followUp
  );
  const emptyCatalog = !crm.loading && !crm.error && (crm.metrics?.totalLeads ?? 0) === 0 && !hasFilters;
  const busy = crm.view === 'list' ? crm.listLoading && !crm.listPage.items.length : crm.loading;
  const showBoardFilters = crm.view !== 'dashboard';

  return (
    <Box className="crm-board" sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', maxWidth: '100%' }}>
      <PageHeader title="CRM de prospecção" description="Organize seus contatos e acompanhe as próximas ações comerciais." actions={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<TravelExploreIcon />}
            onClick={() => setProspectingOpen(true)}
            sx={{ textTransform: 'none', minHeight: 44, width: { xs: '100%', sm: 'auto' } }}
          >
            Prospectar
          </Button>
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
            Cadastrar lead
          </Button>
        </Stack>} />

      {busy && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'var(--color-primary)' }} />
        </Box>
      )}

      {!busy && crm.error && (
        <Alert severity="error">
          Não foi possível carregar o CRM. Verifique se sua conta é administrativa da Weper.
        </Alert>
      )}

      {!busy && !crm.error && (
        <>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.25}
            alignItems={{ lg: 'stretch' }}
            className="crm-board-summary"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <CrmMetrics metrics={crm.metrics} />
            </Box>
            <Box sx={{ width: { lg: 280 }, flexShrink: 0 }}>
              <CrmActionCenter
                metrics={crm.metrics}
                onFilterToday={() => crm.setQuickFollowUp('TODAY')}
                onFilterOverdue={() => crm.setQuickFollowUp('OVERDUE')}
                onFilterNoFirstContact={() => crm.setQuickFollowUp('NO_FIRST_CONTACT')}
              />
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ md: 'flex-start' }}
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {showBoardFilters && (
                <CrmFilters
                  filters={crm.filters}
                  onChange={crm.setFilter}
                  onQuickFollowUp={crm.setQuickFollowUp}
                  onClear={crm.clearFilters}
                />
              )}
            </Box>
            <ToggleButtonGroup
              aria-label="Visualização do CRM"
              exclusive
              size="small"
              value={crm.view}
              onChange={(_, value) => value && crm.setView(value)}
              sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, mt: { md: showBoardFilters ? 4 : 0 } }}
            >
              <ToggleButton value="dashboard" sx={{ textTransform: 'none', px: 2 }}>Painel</ToggleButton>
              <ToggleButton value="kanban" sx={{ textTransform: 'none', px: 2 }}>Kanban</ToggleButton>
              <ToggleButton value="list" sx={{ textTransform: 'none', px: 2 }}>Lista</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box className="crm-board-main">
            {crm.view === 'dashboard' ? (
              <Box sx={{ overflow: 'auto', minHeight: 0, flex: 1 }}>
                <CrmWhatsAppPanel />
                <CrmOutreachPanel />
                <CrmStatusChart metrics={crm.metrics} />
              </Box>
            ) : crm.view === 'list' ? (
              <CrmLeadList
                pageData={crm.listPage}
                sort={crm.sort}
                loading={crm.listLoading}
                emptyCatalog={emptyCatalog}
                hasFilters={hasFilters}
                onCreate={openCreate}
                onPageChange={crm.setPage}
                onSort={crm.changeSort}
                onOpen={loadDetails}
                onEdit={openEdit}
                onRegisterContact={openContact}
                onChangeStatus={handleStatusChange}
                onArchive={handleArchive}
                onConfirmSend={handleConfirmSend}
              />
            ) : (
              <CrmKanban
                leads={crm.leads}
                emptyCatalog={emptyCatalog}
                hasFilters={hasFilters}
                onCreate={openCreate}
                onOpen={loadDetails}
                onEdit={openEdit}
                onRegisterContact={openContact}
                onChangeStatus={handleStatusChange}
                onArchive={handleArchive}
                onConfirmSend={handleConfirmSend}
              />
            )}
          </Box>
        </>
      )}

      <CrmLeadFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialValues={editingLead}
        onSubmit={handleSaveLead}
        saving={saving}
        error={formError}
      />

      <CrmLeadDetailsDialog
        open={Boolean(detailsLead)}
        lead={detailsLead}
        activities={activities}
        loadingActivities={loadingActivities}
        onClose={() => setDetailsLead(null)}
        onEdit={() => {
          setEditingLead(detailsLead);
          setFormError('');
          setFormOpen(true);
        }}
        onRegisterContact={() => setContactOpen(true)}
        onChangeStatus={handleStatusChange}
        onConfirmSend={() => handleConfirmSend(detailsLead)}
        onArchive={handleArchive}
        saving={saving}
      />

      <CrmLostReasonDialog
        open={lostDialog.open}
        onClose={() => setLostDialog({ open: false, leadId: null })}
        onConfirm={handleLostConfirm}
        saving={saving}
      />

      <CrmContactDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        onSubmit={handleRegisterContact}
        saving={saving}
      />

      <CrmProspectingDialog
        open={prospectingOpen}
        onClose={() => setProspectingOpen(false)}
        onImported={async (data) => {
          try {
            await crm.refetch();
          } catch (err) {
            console.error(err);
          }
          if (data?.imported) {
            showToast(`${data.imported} lead${data.imported === 1 ? '' : 's'} adicionado${data.imported === 1 ? '' : 's'} ao CRM.`);
          }
        }}
        onOpenLead={async (leadId) => {
          if (!leadId) return;
          setProspectingOpen(false);
          try {
            const local = crm.leads.find((lead) => lead.id === leadId)
              || crm.listPage.items.find((lead) => lead.id === leadId);
            const lead = local || (await getCrmLead(leadId)).data;
            await loadDetails(lead);
          } catch (err) {
            showToast(err?.response?.data?.message || 'Não foi possível abrir o lead.', 'error');
          }
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        sx={{ zIndex: 1500 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

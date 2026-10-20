import { CrmWhatsAppOptOut } from './CrmWhatsAppPanel';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useIsMobile } from '../../../../commons/hooks/useResponsive';
import {
  businessTypeLabel,
  CRM_STATUSES,
  formatDateTime,
  locationLabel,
  lostReasonLabel,
  phoneContactLabel,
  sourceLabel,
} from '../crmConstants';
import { buildInstagramUrl } from '../instagram';
import { openWhatsAppLead } from '../whatsappTemplate';
import { CrmActivityTimeline } from './CrmActivityTimeline';
import { CrmFollowUpIndicator } from './CrmFollowUpIndicator';
import { CrmInstagramButton } from './CrmInstagramButton';
import { CrmLeadMenu } from './CrmLeadMenu';

function Field({ label, value, href }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {href && value ? (
        <Typography
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'block', wordBreak: 'break-word', color: 'var(--color-primary)' }}
        >
          {value}
        </Typography>
      ) : (
        <Typography sx={{ wordBreak: 'break-word' }}>{value || '—'}</Typography>
      )}
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>{title}</Typography>
      {children}
    </Box>
  );
}

export function CrmLeadDetailsDialog({
  open,
  lead,
  activities,
  loadingActivities,
  onClose,
  onEdit,
  onRegisterContact,
  onChangeStatus,
  onConfirmSend,
  onArchive,
  saving,
}) {
  const isMobile = useIsMobile();
  const [status, setStatus] = useState(lead?.status || 'NEW');
  const [whatsAppBlocked, setWhatsAppBlocked] = useState(false);

  useEffect(() => { setWhatsAppBlocked(false); }, [lead?.id]);

  useEffect(() => {
    setStatus(lead?.status || 'NEW');
  }, [lead]);

  if (!lead) return null;

  const content = (
    <>
      <Typography color="text.secondary">{businessTypeLabel(lead.businessType)}</Typography>
      <Typography color="text.secondary" sx={{ mb: 1.5 }}>{locationLabel(lead)}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          variant="contained"
          disabled={!lead.phone || whatsAppBlocked}
          onClick={() => openWhatsAppLead(lead.id)}
          sx={{
            textTransform: 'none',
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          Abrir no WhatsApp
        </Button>
        <Button
          variant="outlined"
          disabled={!lead.phone || whatsAppBlocked || saving || lead.status === 'WON' || lead.status === 'LOST'}
          onClick={onConfirmSend}
          sx={{ textTransform: 'none' }}
        >
          Marcar como enviada
        </Button>
        <CrmInstagramButton instagram={lead.instagram} />
        <Button variant="outlined" onClick={onRegisterContact} sx={{ textTransform: 'none' }}>
          Registrar contato
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Abrir o WhatsApp não registra envio. Após colar e enviar a mensagem, use &quot;Marcar como enviada&quot;.
      </Typography>
      <CrmWhatsAppOptOut key={lead.id} lead={lead} onBlocked={setWhatsAppBlocked} />

      <Section title="Prazo da próxima ação">
        <CrmFollowUpIndicator lead={lead} />
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
          Tentativas: {lead.contactAttempts ?? 0}
          {lead.deadlineStateLabel ? ` · ${lead.deadlineStateLabel}` : ''}
        </Typography>
      </Section>

      <Section title="Contato">
        <Stack spacing={1.25}>
          <Field label="Responsável" value={lead.contactName} />
          <Field label={phoneContactLabel(lead)} value={lead.phone} />
          <Field label="E-mail" value={lead.email} />
          <Field label="Instagram" value={lead.instagram} href={buildInstagramUrl(lead.instagram)} />
          <Field label="Site" value={lead.website} />
        </Stack>
      </Section>

      <Section title="Comercial">
        <Stack spacing={1.25}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              disabled={saving}
              onChange={(event) => {
                const next = event.target.value;
                if (next === 'LOST') {
                  onChangeStatus(lead, next);
                  return;
                }
                setStatus(next);
                onChangeStatus(lead, next);
              }}
            >
              {CRM_STATUSES.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Field label="Origem" value={sourceLabel(lead.source)} />
          {lead.status === 'LOST' && (
            <Field label="Motivo da perda" value={lead.lostReasonLabel || lostReasonLabel(lead.lostReason)} />
          )}
          <Field label="Descoberto em" value={formatDateTime(lead.discoveredAt)} />
          <Field label="Primeiro contato" value={formatDateTime(lead.firstContactAt)} />
          <Field label="Último contato" value={formatDateTime(lead.lastContactAt)} />
          <Field label="Última resposta" value={formatDateTime(lead.lastResponseAt)} />
          <Field label="Próxima ação" value={formatDateTime(lead.nextContactAt || lead.activeAction?.dueAt)} />
        </Stack>
      </Section>

      <Section title="Observações">
        <Typography color={lead.notes ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
          {lead.notes || 'Nenhuma observação.'}
        </Typography>
      </Section>

      {lead.status === 'WON' && (
        <Section title="Conversão">
          <Tooltip title="Fluxo de conversão em cliente Weper será disponibilizado em breve.">
            <span>
              <Button disabled variant="outlined" sx={{ textTransform: 'none' }}>
                Converter em cliente Weper
              </Button>
            </span>
          </Tooltip>
        </Section>
      )}

      <Divider sx={{ my: 2.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Histórico</Typography>
      <CrmActivityTimeline activities={activities} loading={loadingActivities} />
    </>
  );

  const headerActions = (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <CrmLeadMenu
        lead={lead}
        onEdit={() => onEdit(lead)}
        onRegisterContact={onRegisterContact}
        onChangeStatus={onChangeStatus}
        onConfirmSend={() => onConfirmSend?.(lead)}
        onArchive={onArchive}
      />
      <IconButton onClick={onClose} aria-label="Fechar">
        <CloseIcon />
      </IconButton>
    </Stack>
  );

  if (isMobile) {
    return (
      <Dialog open={open} onClose={onClose} fullScreen>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, pr: 1 }}>{lead.businessName}</Typography>
          {headerActions}
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { sm: 520, md: 560 },
          maxWidth: '100%',
          p: 0,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{lead.businessName}</Typography>
        {headerActions}
      </Box>
      <Box sx={{ px: 3, py: 2, overflowY: 'auto' }}>{content}</Box>
    </Drawer>
  );
}

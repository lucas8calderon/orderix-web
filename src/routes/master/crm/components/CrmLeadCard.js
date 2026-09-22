import React from 'react';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { Draggable } from 'react-beautiful-dnd';
import { businessTypeLabel, locationLabel } from '../crmConstants';
import { openWhatsApp } from '../whatsappTemplate';
import { CrmFollowUpIndicator } from './CrmFollowUpIndicator';
import { CrmLeadMenu } from './CrmLeadMenu';

export function CrmLeadCard({
  lead,
  index,
  onOpen,
  onEdit,
  onRegisterContact,
  onChangeStatus,
  onArchive,
}) {
  const followUp = lead.followUpState || 'NONE';

  return (
    <Draggable draggableId={String(lead.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.85 : 1,
          }}
        >
          <Paper
            elevation={snapshot.isDragging ? 6 : 0}
            onClick={() => onOpen(lead)}
            className={`crm-lead-card ${followUp === 'OVERDUE' ? 'is-overdue' : ''} ${followUp === 'TODAY' ? 'is-today' : ''}`}
            sx={{
              p: 1.25,
              mb: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={0.25} sx={{ mb: 0.5 }}>
              <IconButton
                size="small"
                className="crm-drag-handle"
                aria-label="Arrastar card"
                {...provided.dragHandleProps}
                onClick={(event) => event.stopPropagation()}
                sx={{ mt: -0.5, ml: -0.75, cursor: 'grab', color: 'text.secondary' }}
              >
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
              <Typography fontWeight={700} sx={{ wordBreak: 'break-word', flex: 1, lineHeight: 1.3 }}>
                {lead.businessName}
              </Typography>
              <Box onClick={(event) => event.stopPropagation()}>
                <CrmLeadMenu
                  lead={lead}
                  onEdit={onEdit}
                  onRegisterContact={onRegisterContact}
                  onChangeStatus={onChangeStatus}
                  onArchive={onArchive}
                />
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block">
              {businessTypeLabel(lead.businessType)}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.35 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption">{locationLabel(lead)}</Typography>
            </Stack>
            <Box sx={{ mt: 0.85 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
                Próximo contato
              </Typography>
              <CrmFollowUpIndicator lead={lead} compact />
            </Box>
            <Stack
              direction="row"
              spacing={0.25}
              justifyContent="flex-end"
              sx={{ mt: 0.75 }}
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip title={lead.phone ? 'Abrir WhatsApp' : 'Sem telefone cadastrado'}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!lead.phone}
                    aria-label="WhatsApp"
                    onClick={() => openWhatsApp(lead.whatsAppUrl || lead.phone)}
                  >
                    <ChatOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Detalhes">
                <IconButton size="small" aria-label="Detalhes" onClick={() => onOpen(lead)}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        </div>
      )}
    </Draggable>
  );
}

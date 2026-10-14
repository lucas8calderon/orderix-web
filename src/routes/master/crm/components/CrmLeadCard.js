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
import { CrmInstagramButton } from './CrmInstagramButton';
import { CrmLeadMenu } from './CrmLeadMenu';
import { CrmLeadMoveButtons } from './CrmLeadMoveButtons';

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
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.85 : 1,
          }}
        >
          <Paper
            elevation={snapshot.isDragging ? 6 : 0}
            onClick={() => onOpen(lead)}
            className={`crm-lead-card ${followUp === 'OVERDUE' ? 'is-overdue' : ''} ${followUp === 'TODAY' ? 'is-today' : ''} ${snapshot.isDragging ? 'is-dragging' : ''}`}
            sx={{
              p: 1.25,
              mb: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'grab',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={0.25} sx={{ mb: 0.5 }}>
              <Box
                className="crm-drag-handle"
                aria-hidden="true"
                sx={{ mt: 0.15, color: 'text.secondary', display: 'flex' }}
              >
                <DragIndicatorIcon fontSize="small" />
              </Box>
              <Typography fontWeight={700} sx={{ wordBreak: 'break-word', flex: 1, lineHeight: 1.3 }}>
                {lead.businessName}
              </Typography>
              <Box
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
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
            <Box sx={{ mt: 0.85 }}>
              <CrmLeadMoveButtons
                status={lead.status}
                onMove={(status) => onChangeStatus?.(lead, status)}
              />
            </Box>
            <Stack
              direction="row"
              spacing={0.25}
              justifyContent="flex-end"
              sx={{ mt: 0.75 }}
              onMouseDown={(event) => event.stopPropagation()}
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
              <CrmInstagramButton variant="icon" instagram={lead.instagram} />
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

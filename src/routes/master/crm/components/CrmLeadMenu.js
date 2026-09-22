import React, { useState } from 'react';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { CRM_STATUSES, statusLabel } from '../crmConstants';

export function CrmLeadMenu({
  lead,
  onEdit,
  onRegisterContact,
  onChangeStatus,
  onArchive,
}) {
  const [anchor, setAnchor] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);
  const open = Boolean(anchor);

  const close = () => {
    setAnchor(null);
    setStatusAnchor(null);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="Mais ações"
        onClick={(event) => {
          event.stopPropagation();
          setAnchor(event.currentTarget);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem onClick={() => { close(); onEdit?.(lead); }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { close(); onRegisterContact?.(lead); }}>
          <ListItemIcon><SpeakerNotesOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Registrar contato</ListItemText>
        </MenuItem>
        <MenuItem onClick={(event) => setStatusAnchor(event.currentTarget)}>
          <ListItemIcon><SwapHorizOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Alterar status</ListItemText>
        </MenuItem>
        {lead?.status !== 'WON' && (
          <MenuItem onClick={() => { close(); onChangeStatus?.(lead, 'WON'); }}>
            <ListItemIcon><EmojiEventsOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Marcar como ganho</ListItemText>
          </MenuItem>
        )}
        {lead?.status !== 'LOST' && (
          <MenuItem onClick={() => { close(); onChangeStatus?.(lead, 'LOST'); }}>
            <ListItemIcon><HighlightOffOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Marcar como perdido</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { close(); onArchive?.(lead); }}>
          <ListItemIcon><ArchiveOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Arquivar</ListItemText>
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {CRM_STATUSES.map((item) => (
          <MenuItem
            key={item.id}
            selected={lead?.status === item.id}
            disabled={lead?.status === item.id}
            onClick={() => { close(); onChangeStatus?.(lead, item.id); }}
          >
            {statusLabel(item.id)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

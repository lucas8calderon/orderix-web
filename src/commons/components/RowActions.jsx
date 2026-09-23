import { useId, useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export function RowActions({ name, onEdit, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  const id = useId();
  const choose = action => { setAnchor(null); action(); };
  return <>
    <IconButton aria-label={'Ações de ' + name} aria-haspopup="menu" aria-controls={anchor ? id : undefined} aria-expanded={Boolean(anchor)} onClick={event => { event.stopPropagation(); setAnchor(event.currentTarget); }}><MoreHorizIcon fontSize="small" /></IconButton>
    <Menu id={id} anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={event => event.stopPropagation()}>
      {onEdit && <MenuItem onClick={() => choose(onEdit)}><ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon><ListItemText>Editar</ListItemText></MenuItem>}
      {onDelete && <MenuItem onClick={() => choose(onDelete)} sx={{ color: 'error.main' }}><ListItemIcon sx={{ color: 'inherit' }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon><ListItemText>Excluir</ListItemText></MenuItem>}
    </Menu>
  </>;
}

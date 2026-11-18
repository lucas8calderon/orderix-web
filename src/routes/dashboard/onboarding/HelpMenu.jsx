import { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { HelpCircle, ListChecks, MessageCircle, Sparkles } from 'lucide-react';
import { onboardingSupportUrl } from '../../../services/onboardingService';

/** Ajuda do painel: rever a apresentação, reabrir o checklist e falar com o suporte. */
export default function HelpMenu({ onWelcome, onChecklist, compact = false }) {
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);

  return (
    <>
      <Button
        size="small"
        color="inherit"
        className="weper-shell-help"
        startIcon={<HelpCircle size={18} />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-label="Ajuda"
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600, minWidth: 0 }}
      >
        {compact ? null : 'Ajuda'}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        <MenuItem onClick={() => { close(); onWelcome(); }}>
          <ListItemIcon><Sparkles size={18} /></ListItemIcon>
          <ListItemText>Conheça a Weper</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { close(); onChecklist(); }}>
          <ListItemIcon><ListChecks size={18} /></ListItemIcon>
          <ListItemText>Primeiros passos da loja</ListItemText>
        </MenuItem>
        <MenuItem component="a" href={onboardingSupportUrl()} target="_blank" rel="noopener noreferrer" onClick={close}>
          <ListItemIcon><MessageCircle size={18} /></ListItemIcon>
          <ListItemText>Falar com suporte</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

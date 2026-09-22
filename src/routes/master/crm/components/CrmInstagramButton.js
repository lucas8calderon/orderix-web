import React from 'react';
import { Button, IconButton, SvgIcon, Tooltip } from '@mui/material';
import { buildInstagramUrl, openInstagram } from '../instagram';

function InstagramGlyph(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.8A2 2 0 1 0 14 12a2 2 0 0 0-2-2zm4.7-2.95a.95.95 0 1 1-.95.95.95.95 0 0 1 .95-.95z" />
    </SvgIcon>
  );
}

export function CrmInstagramButton({ instagram, variant = 'button', size = 'small' }) {
  const url = buildInstagramUrl(instagram);
  if (!url) return null;

  const open = () => openInstagram(instagram);

  if (variant === 'icon') {
    return (
      <Tooltip title="Abrir Instagram">
        <IconButton size={size} aria-label="Instagram" onClick={open}>
          <InstagramGlyph fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      variant="outlined"
      onClick={open}
      startIcon={variant === 'compact' ? undefined : <InstagramGlyph fontSize="small" />}
      sx={{ textTransform: 'none', minHeight: variant === 'compact' ? 36 : undefined }}
    >
      {variant === 'compact' ? 'Instagram' : 'Abrir no Instagram'}
    </Button>
  );
}

import React, { useState } from 'react';
import { Button, IconButton, SvgIcon, Tooltip } from '@mui/material';
import { buildInstagramUrl, openInstagram } from '../instagram';
import { CrmInstagramOutreachDialog } from './CrmInstagramOutreachDialog';

function InstagramGlyph(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.8A2 2 0 1 0 14 12a2 2 0 0 0-2-2zm4.7-2.95a.95.95 0 1 1-.95.95.95.95 0 0 1 .95-.95z" />
    </SvgIcon>
  );
}

export function CrmInstagramButton({
  lead,
  instagram,
  variant = 'button',
  size = 'small',
  onUpdated,
}) {
  const value = lead?.instagram || lead?.instagramUsername || instagram;
  const url = buildInstagramUrl(value);
  const [open, setOpen] = useState(false);
  if (!url) return null;

  const activate = (event) => {
    event?.stopPropagation?.();
    if (lead?.id) {
      setOpen(true);
      return;
    }
    openInstagram(value);
  };

  const control = variant === 'icon' ? (
    <Tooltip title="Mensagem no Instagram">
      <IconButton
        size={size}
        aria-label="Instagram"
        onClick={activate}
        sx={{ color: 'var(--color-primary)' }}
      >
        <InstagramGlyph fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      size={size}
      variant="outlined"
      aria-label="Instagram"
      onClick={activate}
      startIcon={variant === 'compact' ? undefined : <InstagramGlyph fontSize="small" />}
      sx={{
        textTransform: 'none',
        minHeight: variant === 'compact' ? 36 : undefined,
        color: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
      }}
    >
      Instagram
    </Button>
  );

  return (
    <>
      {control}
      {lead?.id && (
        <CrmInstagramOutreachDialog
          open={open}
          lead={lead}
          onClose={() => setOpen(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}

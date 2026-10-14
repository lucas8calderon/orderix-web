import React from 'react';
import { Button, Stack } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { adjacentStatus, statusLabel } from '../crmConstants';

export function CrmLeadMoveButtons({ status, onMove }) {
  const previous = adjacentStatus(status, -1);
  const next = adjacentStatus(status, 1);
  if (!previous && !next) return null;

  const move = (event, target) => {
    event.stopPropagation();
    onMove?.(target);
  };

  return (
    <Stack
      direction="row"
      spacing={0.5}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {previous && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChevronLeftIcon />}
          aria-label={`Mover para ${statusLabel(previous)}`}
          onClick={(event) => move(event, previous)}
          sx={{
            flex: 1,
            minWidth: 0,
            textTransform: 'none',
            fontSize: 11,
            lineHeight: 1.2,
            py: 0.4,
            px: 0.75,
          }}
        >
          {statusLabel(previous)}
        </Button>
      )}
      {next && (
        <Button
          size="small"
          variant="outlined"
          endIcon={<ChevronRightIcon />}
          aria-label={`Mover para ${statusLabel(next)}`}
          onClick={(event) => move(event, next)}
          sx={{
            flex: 1,
            minWidth: 0,
            textTransform: 'none',
            fontSize: 11,
            lineHeight: 1.2,
            py: 0.4,
            px: 0.75,
          }}
        >
          {statusLabel(next)}
        </Button>
      )}
    </Stack>
  );
}

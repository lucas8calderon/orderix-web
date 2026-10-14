import React from 'react';
import { IconButton, Stack, Tooltip } from '@mui/material';
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
      justifyContent="space-between"
      alignItems="center"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {previous ? (
        <Tooltip title={statusLabel(previous)}>
          <IconButton
            size="small"
            aria-label={`Mover para ${statusLabel(previous)}`}
            onClick={(event) => move(event, previous)}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : <span />}
      {next ? (
        <Tooltip title={statusLabel(next)}>
          <IconButton
            size="small"
            aria-label={`Mover para ${statusLabel(next)}`}
            onClick={(event) => move(event, next)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : <span />}
    </Stack>
  );
}

import React from 'react';
import { Box, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { Draggable, DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import { INSTAGRAM_COLUMNS, columnOf, flagOf, instagramHandle, kindLabel, timeInStage, toneColor, toneOf } from '../instagramCrm';

export function InstagramKanban({ leads, onOpen, onChangeStatus }) {
  const grouped = INSTAGRAM_COLUMNS.reduce((acc, column) => {
    acc[column.id] = [];
    return acc;
  }, {});
  leads.forEach((lead) => {
    const column = columnOf(lead.status);
    if (!grouped[column]) grouped[column] = [];
    grouped[column].push(lead);
  });

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    onChangeStatus(Number(draggableId), destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box className="crm-kanban ig-kanban">
        {INSTAGRAM_COLUMNS.map((column) => (
          <Paper key={column.id} elevation={0} className="crm-kanban-column ig-column" id={`ig-column-${column.id}`}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{column.label}</Typography>
              <Box className="ig-count">{grouped[column.id].length}</Box>
            </Stack>
            <StrictModeDroppable droppableId={column.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="crm-kanban-droppable">
                  {grouped[column.id].map((lead, index) => (
                    <InstagramCard
                      key={lead.id}
                      lead={lead}
                      index={index}
                      onOpen={onOpen}
                      onChangeStatus={onChangeStatus}
                    />
                  ))}
                  {provided.placeholder}
                  {grouped[column.id].length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, py: 2, display: 'block' }}>
                      Nenhum lead nesta etapa.
                    </Typography>
                  )}
                </div>
              )}
            </StrictModeDroppable>
          </Paper>
        ))}
      </Box>
    </DragDropContext>
  );
}

function InstagramCard({ lead, index, onOpen, onChangeStatus }) {
  const tone = toneOf(lead);
  const flag = flagOf(lead);
  return (
    <Draggable draggableId={String(lead.id)} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Box
            className="ig-card"
            role="button"
            tabIndex={0}
            onClick={() => onOpen(lead)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(lead);
              }
            }}
            sx={{ borderLeft: `4px solid ${toneColor(tone)}` }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{lead.businessName}</Typography>
            <Typography variant="body2" color="text.secondary">{instagramHandle(lead)}</Typography>
            <Typography variant="caption" color="text.secondary">{kindLabel(lead.leadKind)}</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>{timeInStage(lead)}</Typography>
            {flag && (
              <Typography variant="caption" sx={{ color: toneColor(tone), fontWeight: 700, display: 'block' }}>
                {flag}
              </Typography>
            )}
            <Select
              size="small"
              value={columnOf(lead.status)}
              aria-label={`Etapa de ${lead.businessName}`}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onChangeStatus(lead.id, event.target.value)}
              sx={{ mt: 1, width: '100%' }}
            >
              {INSTAGRAM_COLUMNS.map((column) => (
                <MenuItem key={column.id} value={column.id}>{column.label}</MenuItem>
              ))}
            </Select>
          </Box>
        </div>
      )}
    </Draggable>
  );
}

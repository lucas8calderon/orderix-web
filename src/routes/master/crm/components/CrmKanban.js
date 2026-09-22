import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { DragDropContext } from 'react-beautiful-dnd';
import { CRM_STATUSES } from '../crmConstants';
import { StrictModeDroppable } from './StrictModeDroppable';
import { CrmLeadCard } from './CrmLeadCard';
import { CrmEmptyState } from './CrmEmptyState';

export function CrmKanban({
  leads,
  emptyCatalog,
  hasFilters,
  onOpen,
  onCreate,
  onEdit,
  onRegisterContact,
  onChangeStatus,
  onArchive,
}) {
  const grouped = CRM_STATUSES.reduce((acc, column) => {
    acc[column.id] = leads.filter((lead) => lead.status === column.id);
    return acc;
  }, {});

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const leadId = Number(draggableId);
    if (!leadId) return;
    onChangeStatus({ id: leadId }, destination.droppableId);
  };

  if (emptyCatalog) {
    return <CrmEmptyState variant="kanban" onCreate={onCreate} />;
  }

  if (hasFilters && leads.length === 0) {
    return <CrmEmptyState variant="search" />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box className="crm-kanban">
        {CRM_STATUSES.map((column) => (
          <Paper
            key={column.id}
            elevation={0}
            className={`crm-kanban-column ${column.id === 'LOST' ? 'is-lost' : ''} ${column.id === 'WON' ? 'is-won' : ''}`}
            sx={{
              minWidth: 260,
              width: 260,
              flexShrink: 0,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {column.label}
              </Typography>
              <Box
                sx={{
                  minWidth: 24,
                  height: 24,
                  px: 0.75,
                  borderRadius: 10,
                  bgcolor: 'action.selected',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {(grouped[column.id] || []).length}
              </Box>
            </Stack>
            <StrictModeDroppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`crm-kanban-droppable ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                >
                  {(grouped[column.id] || []).map((lead, index) => (
                    <CrmLeadCard
                      key={lead.id}
                      lead={lead}
                      index={index}
                      onOpen={onOpen}
                      onEdit={onEdit}
                      onRegisterContact={onRegisterContact}
                      onChangeStatus={onChangeStatus}
                      onArchive={onArchive}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </Paper>
        ))}
      </Box>
    </DragDropContext>
  );
}

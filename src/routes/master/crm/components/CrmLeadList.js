import React from 'react';
import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatDate } from '../../../../services/accessControl';
import {
  businessTypeLabel,
  CRM_LIST_COLUMNS,
  locationLabel,
  statusLabel,
} from '../crmConstants';
import { openWhatsApp } from '../whatsappTemplate';
import { CrmEmptyState } from './CrmEmptyState';
import { CrmFollowUpIndicator } from './CrmFollowUpIndicator';
import { CrmInstagramButton } from './CrmInstagramButton';
import { CrmLeadMenu } from './CrmLeadMenu';

export function CrmLeadList({
  pageData,
  sort,
  loading,
  emptyCatalog,
  hasFilters,
  onCreate,
  onPageChange,
  onSort,
  onOpen,
  onEdit,
  onRegisterContact,
  onChangeStatus,
  onArchive,
}) {
  const items = pageData?.items || [];
  const [activeField, activeDir] = (sort || 'nextContactAt,asc').split(',');

  if (!loading && emptyCatalog) {
    return <CrmEmptyState variant="kanban" onCreate={onCreate} />;
  }

  if (!loading && items.length === 0) {
    return <CrmEmptyState variant={hasFilters ? 'search' : 'kanban'} onCreate={hasFilters ? undefined : onCreate} />;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
      }}
    >
      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {CRM_LIST_COLUMNS.map((column) => (
                <TableCell key={column.id} sx={{ bgcolor: 'var(--color-table-header)', fontWeight: 700 }}>
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <TableSortLabel
                      active={activeField === column.id}
                      direction={activeField === column.id && activeDir === 'desc' ? 'desc' : 'asc'}
                      onClick={() => onSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              <TableCell sx={{ bgcolor: 'var(--color-table-header)', fontWeight: 700 }} align="right">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((lead) => (
              <TableRow key={lead.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpen(lead)}>
                <TableCell>
                  <Typography fontWeight={700}>{lead.businessName}</Typography>
                </TableCell>
                <TableCell>{businessTypeLabel(lead.businessType)}</TableCell>
                <TableCell>{locationLabel(lead)}</TableCell>
                <TableCell>{lead.phone || '—'}</TableCell>
                <TableCell>{statusLabel(lead.status)}</TableCell>
                <TableCell>{formatDate(lead.lastContactAt)}</TableCell>
                <TableCell>
                  <CrmFollowUpIndicator lead={lead} compact />
                </TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <Stack direction="row" spacing={0.25} justifyContent="flex-end">
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
                    <CrmLeadMenu
                      lead={lead}
                      onEdit={onEdit}
                      onRegisterContact={onRegisterContact}
                      onChangeStatus={onChangeStatus}
                      onArchive={onArchive}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pageData?.total || 0}
        page={pageData?.page || 0}
        rowsPerPage={pageData?.size || 25}
        rowsPerPageOptions={[25]}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        labelRowsPerPage="Por página"
      />
    </Paper>
  );
}

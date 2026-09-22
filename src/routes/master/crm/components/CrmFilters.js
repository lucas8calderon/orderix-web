import React from 'react';
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import {
  CRM_BUSINESS_TYPES,
  CRM_SOURCES,
  CRM_STATUSES,
  FOLLOW_UP_FILTERS,
} from '../crmConstants';

export function CrmFilters({ filters, onChange, onQuickFollowUp, onClear }) {
  return (
    <Stack spacing={1} className="crm-filters">
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {FOLLOW_UP_FILTERS.map((item) => (
          <Chip
            key={item.id || 'all'}
            label={item.label}
            color={filters.followUp === item.id ? 'primary' : 'default'}
            variant={filters.followUp === item.id ? 'filled' : 'outlined'}
            onClick={() => onQuickFollowUp(item.id)}
            size="small"
          />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Button size="small" onClick={onClear} sx={{ textTransform: 'none' }}>
          Limpar filtros
        </Button>
      </Stack>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        sx={{
          p: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          size="small"
          label="Buscar estabelecimento, responsável ou telefone"
          value={filters.q}
          onChange={(event) => onChange('q', event.target.value)}
          sx={{ flex: 1.4, minWidth: { md: 240 } }}
        />
        <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {CRM_STATUSES.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
          <InputLabel>Segmento</InputLabel>
          <Select
            label="Segmento"
            value={filters.businessType}
            onChange={(event) => onChange('businessType', event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {CRM_BUSINESS_TYPES.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Cidade"
          value={filters.city}
          onChange={(event) => onChange('city', event.target.value)}
          sx={{ minWidth: 140, flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
          <InputLabel>Origem</InputLabel>
          <Select label="Origem" value={filters.source} onChange={(event) => onChange('source', event.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            {CRM_SOURCES.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}

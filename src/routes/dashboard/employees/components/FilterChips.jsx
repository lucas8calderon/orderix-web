import React from 'react';
import { Box } from '@mui/material';

export function FilterChips({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'STORE_ADMIN', label: 'Administrador' },
    { id: 'GARCOM', label: 'Garçom' },
    { id: 'KITCHEN', label: 'Cozinha' },
    { id: 'CASHIER', label: 'Caixa' },
  ];

  return (
    <Box className="filter-chips-container">
      {filters.map((filter) => (
        <Box
          key={filter.id}
          className={`filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </Box>
      ))}
    </Box>
  );
}

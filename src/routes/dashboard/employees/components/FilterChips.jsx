import React from 'react';
import { Box } from '@mui/material';

export function FilterChips({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'GARCOM', label: 'Garçom' },
    { id: 'ADMIN', label: 'Administrador' },
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

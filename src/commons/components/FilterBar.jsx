import { Box } from '@mui/material';
import './AppShell.css';

export function FilterBar({ children, label = 'Filtros' }) {
  return (
    <Box className="weper-filter-bar" role="search" aria-label={label}>
      {children}
    </Box>
  );
}

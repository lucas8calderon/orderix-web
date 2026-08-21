import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export function SearchBar({ onSearch, placeholder = "Buscar colaborador por nome ou função" }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <TextField
      className="search-bar"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#9CA3AF' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--color-input-bg)',
          borderRadius: '12px',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
          },
        },
        width: '100%',
        maxWidth: { xs: '100%', sm: 420 },
      }}
    />
  );
}


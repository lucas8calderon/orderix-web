import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';

export function ProductSearch({ value, onChange, inputRef }) {
  return (
    <TextField
      fullWidth
      size="small"
      type="search"
      placeholder="Buscar produto (nome, código ou categoria)..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      inputRef={inputRef}
      inputProps={{
        'aria-label': 'Buscar produto',
        'aria-keyshortcuts': 'Control+K',
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <span className="counter-search-hint">Ctrl K</span>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: 'var(--color-surface)',
        },
      }}
    />
  );
}

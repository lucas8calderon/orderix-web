import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export function BasicSelect({ onSelected }) {
    const [option, setOption] = React.useState(1);

    const handleChange = (event) => {
        setOption(event.target.value);
        onSelected(event.target.value);
    };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel>Está disponível?</InputLabel>
        <Select
          value={option}
          label="Está disponível?"
          onChange={handleChange}
        >
          <MenuItem value={1}>Sim</MenuItem>
          <MenuItem value={2}>Não</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
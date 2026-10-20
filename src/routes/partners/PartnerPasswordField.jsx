import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

/** Campo de senha com mostrar/ocultar. Repassa as demais props ao TextField. */
export function PartnerPasswordField({ label = 'Senha', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      fullWidth
      label={label}
      type={visible ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              size="small"
              aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setVisible((value) => !value)}
              onMouseDown={(event) => event.preventDefault()}
            >
              {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}

export default PartnerPasswordField;

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../../theme/ThemeContext';

export function ThemeToggleButton({
  color = 'inherit',
  size = 'medium',
  className = '',
}) {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';
  const label = isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro';

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={toggleTheme}
        aria-label={label}
        color={color}
        size={size}
        className={`theme-toggle-btn ${className}`.trim()}
        sx={{
          minWidth: 40,
          minHeight: 40,
          color: 'inherit',
        }}
      >
        {isDark ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

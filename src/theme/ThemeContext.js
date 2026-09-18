import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './createAppTheme';
import {
  applyThemeToDocument,
  getPreferredTheme,
  persistTheme,
} from './themeStorage';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light' || current === 'dark') {
        return current;
      }
    }
    return getPreferredTheme();
  });

  useEffect(() => {
    applyThemeToDocument(mode);
    persistTheme(mode);
  }, [mode]);

  const setTheme = useCallback((nextMode) => {
    const resolved = nextMode === 'dark' ? 'dark' : 'light';
    persistTheme(resolved);
    applyThemeToDocument(resolved);
    setMode(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setTheme]);

  const muiTheme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, toggleTheme, setTheme }),
    [mode, toggleTheme, setTheme]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

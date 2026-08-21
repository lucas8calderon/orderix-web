import { createTheme } from '@mui/material/styles';

const fontFamily = '"Inter", sans-serif';

export function createAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#A78BFA' : '#8B5CF6',
        light: isDark ? '#C4B5FD' : '#A78BFA',
        dark: isDark ? '#8B5CF6' : '#7C3AED',
        contrastText: isDark ? '#1E1B4B' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#C4B5FD' : '#0F172A',
        contrastText: isDark ? '#0F172A' : '#FFFFFF',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#64748B',
        disabled: isDark ? '#64748B' : '#94A3B8',
      },
      divider: isDark ? '#334155' : '#E2E8F0',
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
      error: { main: isDark ? '#F87171' : '#B91C1C' },
      info: { main: isDark ? '#60A5FA' : '#3B82F6' },
      action: {
        hover: isDark ? 'rgba(167, 139, 250, 0.12)' : 'rgba(139, 92, 246, 0.08)',
        selected: isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(139, 92, 246, 0.12)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography: {
      fontFamily,
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 600, letterSpacing: '-0.01em' },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: {
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            fontFamily,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.18)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            backgroundImage: 'none',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--color-shadow)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            backdropFilter: 'blur(12px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: 'var(--color-sidebar)',
            color: 'var(--color-sidebar-text)',
            borderColor: 'transparent',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            maxWidth: '100%',
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            backgroundImage: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: 'var(--color-text-primary)',
            fontWeight: 600,
          },
        },
      },
      MuiDialogContentText: {
        styleOverrides: {
          root: {
            color: 'var(--color-text-secondary)',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            backgroundImage: 'none',
            border: '1px solid var(--color-border)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            backgroundImage: 'none',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1E293B' : '#0F172A',
            color: isDark ? '#F8FAFC' : '#FFFFFF',
            fontFamily,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          },
          head: {
            backgroundColor: 'var(--color-table-header)',
            color: 'var(--color-text-primary)',
            fontWeight: 700,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'var(--color-table-hover)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-input-bg)',
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
          },
          input: {
            color: 'var(--color-text-primary)',
            '&::placeholder': {
              color: 'var(--color-text-muted)',
              opacity: 1,
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-surface-muted)',
            '&:hover': {
              backgroundColor: 'var(--color-surface-elevated)',
            },
            '&.Mui-focused': {
              backgroundColor: 'var(--color-surface-elevated)',
            },
          },
          input: {
            color: 'var(--color-text-primary)',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: 'var(--color-text-secondary)',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: 'var(--color-text-secondary)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          outlined: {
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'var(--color-border)',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'var(--color-sidebar-text)',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: 'inherit',
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 16,
            paddingRight: 16,
            '@media (min-width:600px)': {
              paddingLeft: 24,
              paddingRight: 24,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              outline: '2px solid var(--color-primary)',
              outlineOffset: 2,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

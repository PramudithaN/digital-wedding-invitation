import { createTheme } from '@mui/material/styles';

const DEFAULT_COUNTRY_CODE = '94';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',      // blue-605 – clean, modern, digital blue
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C8A882',      // warm gold accent
      light: '#DEC9A7',
      dark: '#A87E52',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16A34A',
      light: '#BBF7D0',
      dark: '#14532D',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#92400E',
    },
    info: {
      main: '#2563EB',
      light: '#DBEAFE',
      dark: '#1E40AF',
    },
    background: {
      default: '#EFF6FF',   // very light blue tint background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',   // deep slate for modern text contrast
      secondary: '#475569', // slate-600 secondary text
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(15,23,42,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
    '0px 2px 6px rgba(15,23,42,0.08)',
    '0px 4px 12px rgba(15,23,42,0.10)',
    '0px 6px 20px rgba(15,23,42,0.12)',
    '0px 8px 24px rgba(15,23,42,0.14)',
    '0px 10px 28px rgba(15,23,42,0.15)',
    '0px 12px 32px rgba(15,23,42,0.16)',
    '0px 14px 38px rgba(15,23,42,0.17)',
    '0px 16px 44px rgba(15,23,42,0.18)',
    '0px 18px 50px rgba(0,0,0,0.10)',
    '0px 20px 56px rgba(0,0,0,0.11)',
    '0px 22px 60px rgba(0,0,0,0.12)',
    '0px 24px 64px rgba(0,0,0,0.13)',
    '0px 26px 68px rgba(0,0,0,0.14)',
    '0px 28px 72px rgba(0,0,0,0.15)',
    '0px 30px 76px rgba(0,0,0,0.16)',
    '0px 32px 80px rgba(0,0,0,0.17)',
    '0px 34px 84px rgba(0,0,0,0.18)',
    '0px 36px 88px rgba(0,0,0,0.19)',
    '0px 38px 92px rgba(0,0,0,0.20)',
    '0px 40px 96px rgba(0,0,0,0.21)',
    '0px 42px 100px rgba(0,0,0,0.22)',
    '0px 44px 104px rgba(0,0,0,0.23)',
    '0px 46px 108px rgba(0,0,0,0.24)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0px 4px 12px rgba(37,99,235,0.25)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 12px rgba(15,23,42,0.06)',
          border: '1px solid rgba(15,23,42,0.08)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0px 8px 28px rgba(15,23,42,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 12px rgba(15,23,42,0.06)',
          border: '1px solid rgba(15,23,42,0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(15,23,42,0.08)',
          border: '1px solid rgba(15,23,42,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#60A5FA',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563EB',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.72rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#EFF6FF',
            color: '#1E3A8A',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderBottom: '2px solid rgba(37,99,235,0.12)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(37,99,235,0.03)',
          },
          '&:last-child td': { border: 0 },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          color: '#F1F5F9',
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(15,23,42,0.15)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.18)' },
            '& .MuiListItemIcon-root': { color: '#F1F5F9' },
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: '#94A3B8',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.82rem',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

export default theme;

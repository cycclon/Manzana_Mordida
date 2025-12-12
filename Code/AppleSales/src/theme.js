import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// Manzana Mordida brand colors
const brandRed = '#e31837'; // Primary red from logo
const brandRedLight = '#ff4d6a';
const brandRedDark = '#a11228';
const neonGlow = '0 0 10px rgba(227, 24, 55, 0.5), 0 0 20px rgba(227, 24, 55, 0.3), 0 0 30px rgba(227, 24, 55, 0.2)';
const neonGlowStrong = '0 0 10px rgba(227, 24, 55, 0.7), 0 0 20px rgba(227, 24, 55, 0.5), 0 0 40px rgba(227, 24, 55, 0.3)';

// Gradient text styles (exported for use in components)
export const gradientText = {
  background: `linear-gradient(135deg, #ffffff 0%, ${brandRedLight} 50%, ${brandRed} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export const gradientTextSubtle = {
  background: `linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 50%, ${brandRedLight} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export const gradientTextPrice = {
  background: `linear-gradient(135deg, #4caf50 0%, #81c784 50%, #a5d6a7 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export const gradientTextSilver = {
  background: `linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #bdbdbd 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// Create custom dark theme for Manzana Mordida
export const theme = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: {
        main: brandRed,
        light: brandRedLight,
        dark: brandRedDark,
        contrastText: '#fff',
      },
      secondary: {
        main: '#424242',
        light: '#616161',
        dark: '#212121',
        contrastText: '#fff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      info: {
        main: '#29b6f6',
        light: '#4fc3f7',
        dark: '#0288d1',
      },
      background: {
        default: '#0a0a0a',
        paper: '#141414',
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
      action: {
        active: '#fff',
        hover: 'rgba(227, 24, 55, 0.08)',
        selected: 'rgba(227, 24, 55, 0.16)',
        disabled: 'rgba(255, 255, 255, 0.3)',
        disabledBackground: 'rgba(255, 255, 255, 0.12)',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#0a0a0a',
            scrollbarColor: `${brandRed} #1a1a1a`,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#1a1a1a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: brandRed,
              borderRadius: '4px',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.3s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: neonGlow,
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: brandRedLight,
              boxShadow: neonGlowStrong,
            },
          },
          outlined: {
            borderColor: brandRed,
            '&:hover': {
              borderColor: brandRedLight,
              boxShadow: neonGlow,
              backgroundColor: 'rgba(227, 24, 55, 0.08)',
            },
          },
          outlinedPrimary: {
            '&:hover': {
              boxShadow: neonGlow,
            },
          },
          text: {
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.08)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.15)',
              boxShadow: neonGlow,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#1a1a1a',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(227, 24, 55, 0.5)',
              boxShadow: `0px 8px 30px rgba(0, 0, 0, 0.7), ${neonGlow}`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            backgroundColor: '#1a1a1a',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
          },
          elevation2: {
            backgroundColor: '#1a1a1a',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#0a0a0a',
            backgroundImage: 'none',
            borderBottom: '1px solid rgba(227, 24, 55, 0.3)',
            boxShadow: `0px 2px 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(227, 24, 55, 0.1)`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
          },
          colorPrimary: {
            '&:hover': {
              boxShadow: neonGlow,
            },
          },
          outlined: {
            borderColor: 'rgba(255, 255, 255, 0.23)',
            '&:hover': {
              borderColor: brandRed,
              boxShadow: `0 0 8px rgba(227, 24, 55, 0.4)`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
                transition: 'all 0.3s ease',
              },
              '&:hover fieldset': {
                borderColor: brandRed,
              },
              '&.Mui-focused fieldset': {
                borderColor: brandRed,
                boxShadow: `0 0 8px rgba(227, 24, 55, 0.3)`,
              },
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.08) !important',
            },
          },
          head: {
            backgroundColor: '#1a1a1a',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          },
          head: {
            fontWeight: 600,
            backgroundColor: '#1a1a1a',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1a1a1a',
            backgroundImage: 'none',
            border: '1px solid rgba(227, 24, 55, 0.3)',
            boxShadow: `0px 8px 40px rgba(0, 0, 0, 0.8), ${neonGlow}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#0a0a0a',
            backgroundImage: 'none',
            borderRight: '1px solid rgba(227, 24, 55, 0.3)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1a1a1a',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.7)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.15)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(227, 24, 55, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(227, 24, 55, 0.25)',
              },
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.08)',
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderColor: 'rgba(255, 255, 255, 0.23)',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.15)',
              borderColor: brandRed,
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(227, 24, 55, 0.2)',
              color: brandRed,
              borderColor: brandRed,
              '&:hover': {
                backgroundColor: 'rgba(227, 24, 55, 0.3)',
              },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: brandRed,
            boxShadow: `0 0 10px ${brandRed}`,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            '&:hover': {
              color: brandRed,
            },
            '&.Mui-selected': {
              color: brandRed,
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: brandRed,
          },
          thumb: {
            '&:hover': {
              boxShadow: neonGlow,
            },
            '&.Mui-active': {
              boxShadow: neonGlowStrong,
            },
          },
          track: {
            boxShadow: `0 0 5px rgba(227, 24, 55, 0.5)`,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: brandRed,
              '& + .MuiSwitch-track': {
                backgroundColor: brandRed,
              },
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: brandRed,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: brandRed,
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(227, 24, 55, 0.15)',
                boxShadow: `0 0 8px rgba(227, 24, 55, 0.3)`,
              },
              '&.Mui-selected': {
                backgroundColor: brandRed,
                '&:hover': {
                  backgroundColor: brandRedLight,
                },
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(227, 24, 55, 0.2)',
          },
          bar: {
            backgroundColor: brandRed,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: brandRed,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          standardError: {
            backgroundColor: 'rgba(244, 67, 54, 0.15)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
          },
          standardWarning: {
            backgroundColor: 'rgba(255, 152, 0, 0.15)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
          },
          standardSuccess: {
            backgroundColor: 'rgba(76, 175, 80, 0.15)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          },
          standardInfo: {
            backgroundColor: 'rgba(41, 182, 246, 0.15)',
            border: '1px solid rgba(41, 182, 246, 0.3)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: '#2a2a2a',
            border: '1px solid rgba(227, 24, 55, 0.3)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
          },
          arrow: {
            color: '#2a2a2a',
          },
        },
      },
    },
  },
  esES // Spanish locale
);

export default theme;

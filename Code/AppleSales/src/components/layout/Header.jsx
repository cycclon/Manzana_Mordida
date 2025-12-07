import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  PointOfSale as SalesIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Devices as DevicesIcon,
  CurrencyExchange as CurrencyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCurrencyStore } from '../../store/currencyStore';
import { USER_ROLES } from '../../constants';
import { getInitials } from '../../utils/formatters';
import logoImg from '../../assets/mm.png';

/**
 * Header Component - Sticky navigation bar
 */
export const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isSales } = useAuth();
  const { exchangeRate, fetchExchangeRate } = useCurrencyStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMobileNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Logo / Brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              filter: 'drop-shadow(0 0 8px rgba(227, 24, 55, 0.6))',
            },
          }}
          onClick={() => navigate('/')}
        >
            <Box
              component="img"
              src={logoImg}
              alt="Manzana Mordida"
              sx={{
                height: 40,
                mr: 1.5,
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: '"Exo 2", sans-serif',
                fontWeight: 700,
                letterSpacing: '.05rem',
                textTransform: 'uppercase',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Manzana Mordida
            </Typography>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Navigation Links (Desktop) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Inicio
            </Button>
            <Button
              color="inherit"
              startIcon={<DevicesIcon />}
              onClick={() => navigate('/dispositivos')}
            >
              Dispositivos
            </Button>
          </Box>

          {/* Exchange Rate Display */}
          {exchangeRate && (
            <Chip
              icon={<CurrencyIcon sx={{ fontSize: 16 }} />}
              label={`USD $1 = ARS $${exchangeRate.toLocaleString('es-AR')}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'inherit',
                fontWeight: 500,
                mr: 2,
                display: { xs: 'none', sm: 'flex' },
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          )}

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2">
                    {user?.username || user?.name || user?.email}
                  </Typography>
                  {user?.role && user.role !== 'viewer' && (
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                      {user.role}
                    </Typography>
                  )}
                </Box> */}

                <IconButton
                  size="large"
                  onClick={handleMenuOpen}
                  color="inherit"
                >
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: 36,
                      height: 36,
                      fontSize: '1rem',
                    }}
                  >
                    {getInitials(user?.username || user?.name || user?.email)}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => handleNavigation('/perfil')}>
                    <PersonIcon sx={{ mr: 1 }} fontSize="small" />
                    Mi Perfil
                  </MenuItem>

                  {/* Admin Menu */}
                  {isAdmin && (
                    <MenuItem onClick={() => handleNavigation('/admin')}>
                      <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                      Panel Admin
                    </MenuItem>
                  )}

                  {/* Sales Menu */}
                  {(isSales || isAdmin) && (
                    <MenuItem onClick={() => handleNavigation('/ventas')}>
                      <SalesIcon sx={{ mr: 1 }} fontSize="small" />
                      Panel Ventas
                    </MenuItem>
                  )}

                  <Divider />

                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/registro')}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Registrarse
                </Button>
              </>
            )}
          </Box>
        </Toolbar>

        {/* Mobile Navigation Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleMobileNavigation('/')}>
            <HomeIcon sx={{ mr: 1 }} fontSize="small" />
            Inicio
          </MenuItem>
          <MenuItem onClick={() => handleMobileNavigation('/dispositivos')}>
            <DevicesIcon sx={{ mr: 1 }} fontSize="small" />
            Dispositivos
          </MenuItem>
        </Menu>
    </AppBar>
  );
};

export default Header;

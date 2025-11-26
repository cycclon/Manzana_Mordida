import { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants';
import { getInitials } from '../../utils/formatters';

/**
 * Header Component - Sticky navigation bar
 */
export const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isSales } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

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
          }}
          onClick={() => navigate('/')}
        >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
              }}
            >
              🍎 Manzana Mordida
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

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2">
                    {user?.username || user?.name || user?.email}
                  </Typography>
                  <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                    {user?.role}
                  </Typography>
                </Box>

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

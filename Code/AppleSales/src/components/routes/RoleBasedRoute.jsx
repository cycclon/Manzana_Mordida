import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Typography, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

/**
 * RoleBasedRoute - Requires user to have specific role(s)
 */
export const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, hasAnyRole } = useAuth();

  // Check if user has any of the allowed roles
  const hasAccess = hasAnyRole(allowedRoles);

  if (!hasAccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          No tienes permisos para acceder a esta página.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Tu rol actual: <strong>{user?.role || 'No definido'}</strong>
        </Typography>
        <Button
          variant="contained"
          href="/"
          sx={{ mt: 2 }}
        >
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  return children;
};

export default RoleBasedRoute;

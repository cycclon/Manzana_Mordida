import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import LoginForm from '../../components/forms/LoginForm';

/**
 * LoginPage - User authentication page
 */
export const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresá con tu cuenta de Manzana Mordida
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <LoginForm />
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;

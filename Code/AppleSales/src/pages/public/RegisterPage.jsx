import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import RegisterForm from '../../components/forms/RegisterForm';

/**
 * RegisterPage - New user registration page
 */
export const RegisterPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <PersonAddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Crear Cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Regístrate para comenzar a comprar dispositivos Apple
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <RegisterForm />
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Al registrarte, aceptas nuestros términos de servicio y política de privacidad
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;

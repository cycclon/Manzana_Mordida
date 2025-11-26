import { Container, Typography, Box, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Página No Encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        La página que estás buscando no existe o ha sido movida.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Volver al Inicio
      </Button>
    </Container>
  );
};

export default NotFoundPage;

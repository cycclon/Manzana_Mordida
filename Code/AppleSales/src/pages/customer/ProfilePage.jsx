import { Container, Typography, Box, Paper } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';

export const ProfilePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <AccountCircleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            Mi Perfil
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Página de perfil del cliente - En construcción
        </Typography>
      </Paper>
    </Container>
  );
};

export default ProfilePage;

import { Container, Typography, Box, Paper } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

export const AdminDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <DashboardIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4" component="h1">
          Panel de Administración
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Dashboard de administrador - En construcción
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;

import { Container, Typography, Box, Paper } from '@mui/material';
import { PointOfSale as PointOfSaleIcon } from '@mui/icons-material';

export const SalesDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <PointOfSaleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4" component="h1">
          Panel de Ventas
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Dashboard de ventas - En construcción
        </Typography>
      </Paper>
    </Container>
  );
};

export default SalesDashboard;

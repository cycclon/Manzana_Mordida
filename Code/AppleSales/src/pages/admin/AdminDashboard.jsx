import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  SwapHoriz as TradeInIcon,
  Store as BranchIcon,
  AccountBalance as BankIcon,
  People as UsersIcon,
  Assessment as ReportsIcon,
  TrendingUp as EarningsIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../api/products';
import { reservationsAPI } from '../../api/reservations';
import { PriceDisplay } from '../../components/common/PriceDisplay';

/**
 * AdminDashboard - Main admin dashboard with navigation cards
 */
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProducts: null,
    activeReservations: null,
    pendingTradeIns: null,
    monthlySales: null,
    monthlyEarnings: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all devices
      const devices = await productsAPI.getAllDevices();

      // Active devices count (En Stock or A pedido)
      const activeDevices = devices.filter(d =>
        d.estado === 'En Stock' || d.estado === 'A pedido'
      ).length;

      // Fetch active reservations (Solicitada, Confirmada)
      const reservationsData = await reservationsAPI.getAllReservations();
      const reservations = reservationsData.data || reservationsData || [];
      const activeReservations = reservations.filter(r =>
        r.estado === 'Solicitada' || r.estado === 'Confirmada'
      ).length;

      // Calculate monthly sales and earnings
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();

      const soldDevicesThisMonth = devices.filter(d => {
        if (d.estado !== 'Vendido' || !d.fechaVenta) return false;

        const saleDate = new Date(d.fechaVenta);
        return saleDate.getMonth() === currentMonth &&
               saleDate.getFullYear() === currentYear;
      });

      const monthlySalesCount = soldDevicesThisMonth.length;

      // Calculate earnings (precio - costo) for sold devices this month
      const monthlyEarnings = soldDevicesThisMonth.reduce((total, device) => {
        const profit = (device.precio || 0) - (device.costo || 0);
        return total + profit;
      }, 0);

      setStats({
        activeProducts: activeDevices,
        activeReservations: activeReservations,
        pendingTradeIns: null, // TODO: Implement when trade-in data is available
        monthlySales: monthlySalesCount,
        monthlyEarnings: monthlyEarnings,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Gestión de Productos',
      description: 'Administrar dispositivos, stock, precios e imágenes',
      icon: <DevicesIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
      path: '/admin/productos',
      color: 'primary.main',
    },
    {
      title: 'Gestión de Canjes',
      description: 'Revisar y aprobar solicitudes de canje de dispositivos',
      icon: <TradeInIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
      path: '/admin/canjes',
      color: 'success.main',
    },
    {
      title: 'Gestión de Sucursales',
      description: 'Administrar ubicaciones, horarios y contacto',
      icon: <BranchIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
      path: '/admin/sucursales',
      color: 'info.main',
    },
    {
      title: 'Cuentas Bancarias',
      description: 'Configurar cuentas para recibir pagos',
      icon: <BankIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
      path: '/admin/cuentas',
      color: 'warning.main',
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar clientes, vendedores y administradores',
      icon: <UsersIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
      path: '/admin/usuarios',
      color: 'secondary.main',
    },
    {
      title: 'Reportes y Estadísticas',
      description: 'Ver métricas de ventas, reservas y performance',
      icon: <ReportsIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
      path: '/admin/reportes',
      color: 'error.main',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <DashboardIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Panel de Administración
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona todos los aspectos de tu negocio
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {loading ? <CircularProgress size={40} /> : (stats.activeProducts ?? '-')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Productos Activos
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {loading ? <CircularProgress size={40} /> : (stats.activeReservations ?? '-')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reservas Activas
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {loading ? <CircularProgress size={40} /> : (stats.monthlySales ?? '-')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ventas del Mes
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            {loading ? (
              <CircularProgress size={40} />
            ) : stats.monthlyEarnings !== null ? (
              <PriceDisplay
                usdAmount={stats.monthlyEarnings}
                usdVariant="h4"
                arsVariant="body2"
              />
            ) : (
              <Typography variant="h3" color="text.secondary">-</Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ganancias del Mes
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Cards */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Accesos Rápidos
      </Typography>
      <Grid container spacing={3}>
        {adminSections.map((section) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={section.path}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(section.path)}
                sx={{ height: '100%', p: 3 }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: section.color, mb: 2 }}>
                      {section.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;

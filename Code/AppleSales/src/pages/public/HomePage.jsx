import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import {
  Storefront as StorefrontIcon,
  PhoneIphone as PhoneIcon,
  Laptop as LaptopIcon,
  Watch as WatchIcon,
  Headphones as HeadphonesIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../api/products';
import { reservationsAPI } from '../../api/reservations';
import { handleApiError } from '../../api/client';
import DeviceCard from '../../components/devices/DeviceCard';
import { LoadingScreen } from '../../components/common';
import { gradientTextSilver } from '../../theme';

/**
 * HomePage - Landing page with hero section and featured devices
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredDevices, setFeaturedDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured devices (first 4 available)
  useEffect(() => {
    const fetchFeaturedDevices = async () => {
      try {
        // Fetch reserved device IDs
        const reservedDeviceIds = await reservationsAPI.getReservedDeviceIds();
        const reservedIdsSet = new Set(reservedDeviceIds);

        // Fetch devices
        const response = await productsAPI.getAllDevices({
          page: 1,
          limit: 8, // Fetch more to ensure we get 4 after filtering
        });

        const devices = response.data || response || [];

        // Filter out sold devices
        const availableDevices = devices.filter(
          device => device.estado !== 'Vendido' && device.status !== 'Vendido'
        );

        // Mark devices with reservation status
        const devicesWithReservationStatus = availableDevices.map(device => ({
          ...device,
          isReserved: reservedIdsSet.has(device._id),
          displayEstado: reservedIdsSet.has(device._id) ? 'Reservado' : device.estado,
        }));

        setFeaturedDevices(devicesWithReservationStatus.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured devices:', error);
        // Silently fail - not critical for homepage
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDevices();
  }, []);

  const categories = [
    {
      name: 'iPhone',
      icon: <PhoneIcon sx={{ fontSize: { xs: 32, md: 40 } }} />,
      description: 'Teléfonos inteligentes',
    },
    {
      name: 'MacBook',
      icon: <LaptopIcon sx={{ fontSize: { xs: 32, md: 40 } }} />,
      description: 'Laptops y computadoras',
    },
    {
      name: 'Watch',
      icon: <WatchIcon sx={{ fontSize: { xs: 32, md: 40 } }} />,
      description: 'Relojes inteligentes',
    },
    {
      name: 'AirPods',
      icon: <HeadphonesIcon sx={{ fontSize: { xs: 32, md: 40 } }} />,
      description: 'Audífonos y accesorios',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ py: { xs: 4, md: 8 }, mb: 6 }}>
        <StorefrontIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' }, ...gradientTextSilver }}>
          Bienvenido a Manzana Mordida
        </Typography>
        <Typography variant="h5" paragraph sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, ...gradientTextSilver }}>
          Dispositivos Apple reacondicionados de calidad
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Encuentra los mejores dispositivos Apple reacondicionados con garantía,
          entrega a domicilio y la opción de canjear tu dispositivo usado.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/dispositivos')}
          sx={{ px: 4, py: 1.5 }}
        >
          Ver Todos los Dispositivos
        </Button>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4, ...gradientTextSilver }}>
          Categorías
        </Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={category.name}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate(`/dispositivos?search=${category.name}`)}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {category.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Devices Section */}
      <Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 }, mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' }, ...gradientTextSilver }}>
            Dispositivos Destacados
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/dispositivos')}
          >
            Ver Todos
          </Button>
        </Box>

        {loading ? (
          <LoadingScreen message="Cargando dispositivos destacados..." />
        ) : featuredDevices.length > 0 ? (
          <Grid container spacing={3}>
            {featuredDevices.map((device) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={device._id || device.id}>
                <DeviceCard device={device} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No hay dispositivos disponibles en este momento
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/dispositivos')}
            >
              Ver Catálogo Completo
            </Button>
          </Paper>
        )}
      </Box>

      {/* Benefits Section */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                ✓ Garantía Incluida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todos nuestros dispositivos incluyen garantía y han sido verificados
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                ✓ Canje de Dispositivos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Canjea tu dispositivo usado y obtén un descuento en tu compra
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                ✓ Oficina segura
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visitanos en nuestra oficina en el centro con todas las comodidades
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;

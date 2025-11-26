import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Divider,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EventAvailable as EventIcon,
  BookmarkBorder as ReserveIcon,
  Battery80 as BatteryIcon,
  Memory as StorageIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../api/products';
import { handleApiError } from '../../api/client';
import { useTradeIn } from '../../hooks/useTradeIn';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import ImageCarousel from '../../components/devices/ImageCarousel';
import { DEVICE_CONDITION_LABELS } from '../../constants';
import { toast } from 'react-hot-toast';

/**
 * DeviceDetailPage - Detailed view of a single device
 * Features: Image carousel, full specs, action buttons, trade-in integration
 */
export const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdjustedPrice, hasTradeIn } = useTradeIn();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch device details
  useEffect(() => {
    const fetchDevice = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getDeviceById(id);
        setDevice(response);
      } catch (err) {
        console.error('Error fetching device:', err);
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);

  // Extract data from backend response (handles Spanish field names and nested objects)
  const devicePrice = device?.precio || device?.price || 0;
  const modelo = device?.producto?.modelo || device?.model || 'Unknown Model';
  const colorNombre = device?.color?.nombre || device?.color || '';
  const bateria = device?.condicionBateria ? device?.condicionBateria * 100 : device?.batteryHealth || 0;
  const condicion = device?.condicion || device?.condition;
  const estado = device?.estado || device?.status;
  const imagenes = device?.imagenes || device?.images || [];
  const detalles = device?.detalles || device?.description;
  const grado = device?.grado || device?.grade;

  // Calculate display price
  const displayPrice = device && hasTradeIn
    ? getAdjustedPrice(devicePrice)
    : devicePrice;

  // Check if device is reserved
  const isReserved = estado === 'Reservado' || device?.reserved;

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" height={500} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error || !device) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'No se pudo cargar el dispositivo'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dispositivos')}
        >
          Volver al Marketplace
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dispositivos')}
        sx={{ mb: 3 }}
      >
        Volver al Marketplace
      </Button>

      <Grid container spacing={3}>
        {/* Left column - Images */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ImageCarousel
            images={imagenes}
            alt={modelo}
          />
        </Grid>

        {/* Right column - Details */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Reserved badge */}
            {isReserved && (
              <Alert
                severity="warning"
                icon={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                Este dispositivo está reservado
              </Alert>
            )}

            {/* Model */}
            <Typography variant="h4" component="h1" gutterBottom>
              {modelo}
            </Typography>

            {/* Condition and Grade */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={DEVICE_CONDITION_LABELS[condicion] || condicion}
                color="primary"
                icon={<VerifiedIcon />}
              />
              {grado && (
                <Chip label={`Grado ${grado}`} color="secondary" />
              )}
              {condicion === 'Sealed' && (
                <Chip label="Sellado de Fábrica" color="success" />
              )}
            </Box>

            {/* Price */}
            <Box sx={{ my: 3 }}>
              <PriceDisplay
                usdAmount={displayPrice}
                usdVariant="h3"
                arsVariant="h6"
              />
              {hasTradeIn && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  ✓ Precio con canje aplicado
                </Typography>
              )}
              {devicePrice !== displayPrice && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through', mt: 0.5 }}
                >
                  Precio original: ${devicePrice} USD
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Specifications */}
            <Typography variant="h6" gutterBottom>
              Especificaciones
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {/* Battery */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BatteryIcon
                  color={bateria >= 90 ? 'success' : bateria >= 80 ? 'warning' : 'action'}
                />
                <Typography variant="body1">
                  <strong>Salud de Batería:</strong> {Math.round(bateria)}%
                </Typography>
              </Box>

              {/* Color */}
              {colorNombre && (
                <Box>
                  <Typography variant="body1">
                    <strong>Color:</strong> {colorNombre}
                  </Typography>
                </Box>
              )}

              {/* Estado */}
              <Box>
                <Typography variant="body1">
                  <strong>Estado:</strong> {estado}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Description (if available) */}
            {detalles && (
              <>
                <Typography variant="h6" gutterBottom>
                  Detalles
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {detalles}
                </Typography>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* Action buttons */}
            {!isReserved && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ReserveIcon />}
                  onClick={() => navigate(`/reservar/${device._id || device.id}`)}
                  fullWidth
                >
                  Reservar Dispositivo
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={() => navigate(`/agendar/${device._id || device.id}`)}
                  fullWidth
                >
                  Agendar Cita para Ver
                </Button>
              </Box>
            )}

            {isReserved && (
              <Alert severity="info" icon={<WarningIcon />}>
                Este dispositivo no está disponible para reserva o citas en este momento.
              </Alert>
            )}

            {/* Additional info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" component="div">
                <strong>¿Tienes un dispositivo para canjear?</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Usa la calculadora de canje en la parte superior para ver el precio
                ajustado con tu dispositivo usado.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional details section */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Información Adicional
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ✓ Garantía Incluida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todos nuestros dispositivos incluyen garantía y han sido
                verificados exhaustivamente.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ✓ Entrega a Domicilio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recibe tu dispositivo en la comodidad de tu hogar o retíralo
                en nuestra sucursal.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ✓ Asesoramiento Personalizado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agenda una cita para ver el dispositivo en persona y resolver
                todas tus dudas.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DeviceDetailPage;

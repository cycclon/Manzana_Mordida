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
import { reservationsAPI } from '../../api/reservations';
import { handleApiError } from '../../api/client';
import { useTradeIn } from '../../hooks/useTradeIn';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import ImageCarousel from '../../components/devices/ImageCarousel';
import { DEVICE_CONDITION_LABELS } from '../../constants';
import { toast } from 'react-hot-toast';
import { gradientTextSilver } from '../../theme';

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
  const [isReserved, setIsReserved] = useState(false);

  // Fetch device details
  useEffect(() => {
    const fetchDevice = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getDeviceById(id);
        setDevice(response);

        // Check if device has an active reservation
        const reservedDeviceIds = await reservationsAPI.getReservedDeviceIds();
        const hasActiveReservation = reservedDeviceIds.includes(id);
        setIsReserved(hasActiveReservation);
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
  const linea = device?.producto?.linea || 'N/A';
  const modelo = device?.producto?.modelo || device?.model || 'Unknown Model';
  const colorNombre = device?.color?.nombre || device?.color || '';
  const colorHex = device?.color?.hex || null;
  const bateria = device?.condicionBateria ? device?.condicionBateria * 100 : device?.batteryHealth || 0;
  const condicion = device?.condicion || device?.condition;
  const estado = device?.estado || device?.status;
  const imagenes = device?.imagenes || device?.images || [];
  const detalles = device?.detalles || device?.description;
  const grado = device?.grado || device?.grade;

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Helper function to get contrasting text color
  const getContrastColor = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#000000';
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Display estado - show "Reservado" if there's an active reservation
  const displayEstado = isReserved ? 'Reservado' : estado;

  // Calculate display price
  const displayPrice = device && hasTradeIn
    ? getAdjustedPrice(devicePrice)
    : devicePrice;

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

            {/* Line & Model */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ ...gradientTextSilver }}>
              {linea} {modelo}
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
            <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
              Especificaciones
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {/* Battery - only show if battery health is specified */}
              {bateria > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BatteryIcon
                    color={bateria >= 90 ? 'success' : bateria >= 80 ? 'warning' : 'action'}
                  />
                  <Typography variant="body1">
                    <strong>Salud de Batería:</strong> {Math.round(bateria)}%
                  </Typography>
                </Box>
              )}

              {/* Color */}
              {colorNombre && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    <strong>Color:</strong>
                  </Typography>
                  <Chip
                    label={colorNombre}
                    size="small"
                    sx={colorHex ? {
                      backgroundColor: `${colorHex} !important`,
                      color: `${getContrastColor(colorHex)} !important`,
                      fontWeight: 500,
                    } : {}}
                  />
                </Box>
              )}

              {/* Estado */}
              <Box>
                <Typography variant="body1">
                  <strong>Estado:</strong> {displayEstado}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Description (if available) */}
            {detalles && detalles.trim && detalles.trim() !== '' && (
              <>
                <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
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
                  disabled={isReserved || estado === 'Vendido'}
                >
                  {isReserved ? 'Dispositivo Reservado' : estado === 'A pedido' ? 'Reservá (Señar A pedido)' : 'Reservá este Dispositivo'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={() => navigate(`/agendar/${device._id || device.id}`)}
                  fullWidth
                  disabled={isReserved || estado === 'Vendido' || estado === 'A pedido'}
                >
                  Agendá una Cita para Verlo
                </Button>
              </Box>
            )}

            {isReserved && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                Este dispositivo ya tiene una reserva activa y no está disponible para nuevas reservas o citas.
              </Alert>
            )}

            {estado === 'A pedido' && !isReserved && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Este dispositivo está por pedido y no se encuentra en stock. Podés reservarlo con una seña para solicitarlo al proveedor. No es posible agendar citas para verlo en persona.
              </Alert>
            )}

            {/* Additional info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" component="div">
                <strong>¿Tenés un dispositivo para canjear?</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Usá la calculadora de canje en la parte superior para ver el precio
                ajustado con tu dispositivo usado.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional details section */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ ...gradientTextSilver }}>
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
                Recibí tu dispositivo en la comodidad de tu hogar o retiralo
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
                Agendá una cita para ver el dispositivo en persona y resolver
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

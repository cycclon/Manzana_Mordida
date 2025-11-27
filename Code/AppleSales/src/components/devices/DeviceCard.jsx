import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  EventAvailable as EventIcon,
  BookmarkBorder as ReserveIcon,
  Battery80 as BatteryIcon,
  Memory as StorageIcon,
} from '@mui/icons-material';
import { PriceDisplay } from '../common/PriceDisplay';
import { useTradeIn } from '../../hooks/useTradeIn';
import { DEVICE_CONDITION_LABELS } from '../../constants';
import { getThumbnailUrl } from '../../utils/imageOptimization';

/**
 * DeviceCard - Display device in grid/list with image, specs, and actions
 */
export const DeviceCard = ({ device, showActions = true }) => {
  const navigate = useNavigate();
  const { getAdjustedPrice, hasTradeIn } = useTradeIn();

  // Calculate price (with trade-in adjustment if active)
  const devicePrice = device.precio || device.price || 0;
  const displayPrice = hasTradeIn
    ? getAdjustedPrice(devicePrice)
    : devicePrice;

  // Get first image or placeholder and optimize for thumbnail
  const originalImageUrl = device.imagenes?.[0] || device.images?.[0]?.url || '/placeholder-device.png';
  const imageUrl = getThumbnailUrl(originalImageUrl);

  // Check if device is reserved (use isReserved flag or check displayEstado/estado)
  const isReserved = device.isReserved || device.displayEstado === 'Reservado' || device.estado === 'Reservado' || device.status === 'reserved' || device.reserved;

  // Extract data from nested product object
  const modelo = device.producto?.modelo || device.model || 'Unknown Model';
  const colorNombre = device.color?.nombre || device.color || '';
  const bateria = device.condicionBateria ? device.condicionBateria * 100 : device.batteryHealth || 0;
  const condicion = device.condicion || device.condition;

  const handleViewDetails = () => {
    navigate(`/dispositivo/${device._id || device.id}`);
  };

  const handleBookAppointment = (e) => {
    e.stopPropagation();
    navigate(`/agendar/${device._id || device.id}`);
  };

  const handleMakeReservation = (e) => {
    e.stopPropagation();
    navigate(`/reservar/${device._id || device.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: isReserved ? 0.7 : 1,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
      onClick={handleViewDetails}
    >
      {/* Reserved Badge */}
      {isReserved && (
        <Chip
          label="RESERVADO"
          color="warning"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            fontWeight: 700,
          }}
        />
      )}

      {/* Device Image */}
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={device.model || 'Device'}
        sx={{
          objectFit: 'cover',
          bgcolor: 'grey.100',
        }}
      />

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Model */}
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {modelo}
        </Typography>

        {/* Specs Grid */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {/* Condition */}
          <Chip
            label={DEVICE_CONDITION_LABELS[condicion] || condicion}
            size="small"
            color="primary"
            variant="outlined"
          />

          {/* Battery Health */}
          {bateria > 0 && (
            <Chip
              icon={<BatteryIcon />}
              label={`${bateria}%`}
              size="small"
              color={bateria >= 90 ? 'success' : 'default'}
              variant="outlined"
            />
          )}

          {/* Grade */}
          {device.grado && (
            <Chip
              label={device.grado}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        {/* Color (if available) */}
        {colorNombre && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Color: {colorNombre}
          </Typography>
        )}

        {/* Price */}
        <Box sx={{ mt: 2 }}>
          <PriceDisplay usdAmount={displayPrice} usdVariant="h5" arsVariant="body2" />
          {hasTradeIn && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
              Precio con canje aplicado
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={handleViewDetails}
          >
            Ver Más
          </Button>

          {!isReserved && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={handleBookAppointment}
                title="Agendar Cita"
              >
                <EventIcon />
              </IconButton>
              <IconButton
                size="small"
                color="secondary"
                onClick={handleMakeReservation}
                title="Reservar"
              >
                <ReserveIcon />
              </IconButton>
            </Box>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default DeviceCard;

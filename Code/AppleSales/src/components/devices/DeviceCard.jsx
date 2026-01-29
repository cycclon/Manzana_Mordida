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
import { gradientTextSilver } from '../../theme';

/**
 * DeviceCard - Display device in grid/list with image, specs, and actions
 */
export const DeviceCard = ({ device, showActions = true, listView = false }) => {
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

  // Check if device is "A pedido" (On Order) - can't schedule appointments for devices not in stock
  const isOnOrder = device.displayEstado === 'A pedido' || device.estado === 'A pedido';

  // Extract data from nested product object
  const modelo = device.producto?.modelo || device.model || 'Unknown Model';
  const linea = device.producto?.linea || 'N/A';
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
        height: listView ? '100px' : '100%',
        display: 'flex',
        flexDirection: listView ? 'row' : 'column',
        position: 'relative',
        opacity: isReserved ? 0.7 : 1,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: listView ? 'translateX(4px)' : 'translateY(-4px)',
          boxShadow: 6,
        },
        width: '100%',
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
        height={listView ? undefined : "200"}
        image={imageUrl}
        alt={device.model || 'Device'}
        sx={{
          objectFit: 'cover',
          bgcolor: 'grey.100',
          width: listView ? 100 : '100%',
          minWidth: listView ? 100 : undefined,
          maxWidth: listView ? 100 : undefined,
          height: listView ? '100%' : 200,
        }}
      />

      <CardContent sx={{ flexGrow: 1, pb: 1, display: 'flex', flexDirection: listView ? 'row' : 'column', gap: listView ? 2 : 0, width: '100%', justifyContent: 'space-between', alignItems: listView ? 'center' : 'flex-start' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Line & Model */}
          <Typography variant="h6" component="h3" gutterBottom={!listView} noWrap sx={{ mb: listView ? 0.5 : undefined, ...gradientTextSilver }}>
            {linea} {modelo}
          </Typography>

          {/* Specs Grid */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: listView ? 0 : 2 }}>
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
        </Box>

        {/* Color (if available) - Positioned between specs and price in list view */}
        {listView && colorNombre && (
          <Box sx={{ minWidth: 120, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {colorNombre}
            </Typography>
          </Box>
        )}

        {/* Color in grid view - Below specs */}
        {!listView && colorNombre && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Color: {colorNombre}
          </Typography>
        )}

        {/* Price */}
        <Box sx={{ mt: listView ? 0 : 2, minWidth: listView ? 150 : undefined, textAlign: listView ? 'right' : 'left', display: 'flex', flexDirection: 'column', alignItems: listView ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
          <PriceDisplay usdAmount={displayPrice} usdVariant={listView ? "h6" : "h5"} arsVariant="body2" />
          {hasTradeIn && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
              Precio con canje aplicado
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{
          justifyContent: 'space-between',
          px: 2,
          pb: 2,
          minWidth: listView ? 140 : undefined,
          width: listView ? 140 : undefined,
          flexShrink: 0,
        }}>
          {listView ? (
            <IconButton
              size="small"
              color="primary"
              onClick={handleViewDetails}
              title="Ver Más"
            >
              <VisibilityIcon />
            </IconButton>
          ) : (
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleViewDetails}
            >
              Ver Más
            </Button>
          )}

          {!isReserved && (
            <Box sx={{ display: 'flex', gap: 1, minWidth: listView ? 80 : undefined }}>
              {!isOnOrder && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleBookAppointment}
                  title="Agendá una Cita"
                >
                  <EventIcon />
                </IconButton>
              )}
              <IconButton
                size="small"
                color="secondary"
                onClick={handleMakeReservation}
                title={isOnOrder ? "Reservá (A pedido)" : "Reservá"}
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

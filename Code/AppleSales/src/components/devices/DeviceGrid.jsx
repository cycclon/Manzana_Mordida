import {
  Box,
  Pagination,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  EventAvailable as EventIcon,
  BookmarkBorder as ReserveIcon,
  Battery80 as BatteryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DeviceCard from './DeviceCard';
import { PriceDisplay } from '../common/PriceDisplay';
import { useTradeIn } from '../../hooks/useTradeIn';
import { DEVICE_CONDITION_LABELS } from '../../constants';
import { getThumbnailUrl } from '../../utils/imageOptimization';
import { EmptyState, LoadingScreen } from '../common';

/**
 * DeviceTableRow - Single row in table view
 */
const DeviceTableRow = ({ device, isMobile, isTablet }) => {
  const navigate = useNavigate();
  const { getAdjustedPrice, hasTradeIn } = useTradeIn();

  // Calculate price (with trade-in adjustment if active)
  const devicePrice = device.precio || device.price || 0;
  const displayPrice = hasTradeIn ? getAdjustedPrice(devicePrice) : devicePrice;

  // Get first image or placeholder and optimize for thumbnail
  const originalImageUrl = device.imagenes?.[0] || device.images?.[0]?.url || '/placeholder-device.png';
  const imageUrl = getThumbnailUrl(originalImageUrl);

  // Check if device is reserved
  const isReserved = device.isReserved || device.displayEstado === 'Reservado' || device.estado === 'Reservado' || device.status === 'reserved' || device.reserved;

  // Check if device is "A pedido" (On Order)
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
    <TableRow
      hover
      onClick={handleViewDetails}
      sx={{
        cursor: 'pointer',
        opacity: isReserved ? 0.7 : 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {/* Image */}
      <TableCell sx={{ width: isMobile ? 50 : 80, p: isMobile ? 1 : 2 }}>
        <Avatar
          src={imageUrl}
          alt={modelo}
          variant="rounded"
          sx={{ width: isMobile ? 40 : 64, height: isMobile ? 40 : 64 }}
        />
      </TableCell>

      {/* Model */}
      <TableCell>
        <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight={500}>
          {linea} {modelo}
        </Typography>
      </TableCell>

      {/* Color - hidden on mobile */}
      {!isMobile && (
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {colorNombre || '-'}
          </Typography>
        </TableCell>
      )}

      {/* Condition - hidden on tablet and mobile */}
      {!isTablet && (
        <TableCell>
          <Chip
            label={DEVICE_CONDITION_LABELS[condicion] || condicion}
            size="small"
            color="primary"
            variant="outlined"
          />
        </TableCell>
      )}

      {/* Battery - hidden on tablet and mobile */}
      {!isTablet && (
        <TableCell>
          {bateria > 0 ? (
            <Chip
              icon={<BatteryIcon />}
              label={`${bateria}%`}
              size="small"
              color={bateria >= 90 ? 'success' : 'default'}
              variant="outlined"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">-</Typography>
          )}
        </TableCell>
      )}

      {/* Grade - hidden on tablet and mobile */}
      {!isTablet && (
        <TableCell>
          {device.grado ? (
            <Chip
              label={device.grado}
              size="small"
              color="info"
              variant="outlined"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">-</Typography>
          )}
        </TableCell>
      )}

      {/* Status - hidden on mobile */}
      {!isMobile && (
        <TableCell>
          {isReserved && (
            <Chip
              label="RESERVADO"
              color="warning"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
          {isOnOrder && !isReserved && (
            <Chip
              label="A PEDIDO"
              color="info"
              size="small"
            />
          )}
        </TableCell>
      )}

      {/* Price */}
      <TableCell align="right">
        <PriceDisplay usdAmount={displayPrice} usdVariant={isMobile ? 'body2' : 'body1'} arsVariant="caption" />
        {hasTradeIn && (
          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
            Con canje
          </Typography>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ width: isMobile ? 50 : 140, p: isMobile ? 1 : 2 }}>
        <Box sx={{ display: 'flex', gap: isMobile ? 0 : 1, justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
          <IconButton
            size="small"
            color="primary"
            onClick={handleViewDetails}
            title="Ver Más"
          >
            <VisibilityIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
          {!isMobile && !isReserved && !isOnOrder && (
            <IconButton
              size="small"
              color="primary"
              onClick={handleBookAppointment}
              title="Agendá una Cita"
            >
              <EventIcon />
            </IconButton>
          )}
          {!isMobile && !isReserved && (
            <IconButton
              size="small"
              color="secondary"
              onClick={handleMakeReservation}
              title={isOnOrder ? "Reservá (A pedido)" : "Reservá"}
            >
              <ReserveIcon />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

/**
 * DeviceGrid - Display devices in responsive grid or list with pagination
 */
export const DeviceGrid = ({
  devices = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  viewMode = 'grid',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return <LoadingScreen message="Cargando dispositivos..." />;
  }

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        title="No se encontraron dispositivos"
        description="Intentá ajustar los filtros para ver más resultados"
      />
    );
  }

  return (
    <Box>
      {/* Device Grid or Table */}
      {viewMode === 'grid' ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {devices.map((device) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={device._id || device.id}>
              <DeviceCard device={device} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Imagen</TableCell>
                <TableCell>Modelo</TableCell>
                {!isMobile && <TableCell>Color</TableCell>}
                {!isTablet && <TableCell>Condición</TableCell>}
                {!isTablet && <TableCell>Batería</TableCell>}
                {!isTablet && <TableCell>Grado</TableCell>}
                {!isMobile && <TableCell>Estado</TableCell>}
                <TableCell align="right">Precio</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <DeviceTableRow key={device._id || device.id} device={device} isMobile={isMobile} isTablet={isTablet} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Results Count */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {devices.length} dispositivos
        </Typography>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => onPageChange(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        )}
      </Box>
    </Box>
  );
};

export default DeviceGrid;

import { Box, Pagination, Typography, Grid } from '@mui/material';
import DeviceCard from './DeviceCard';
import { EmptyState, LoadingScreen } from '../common';

/**
 * DeviceGrid - Display devices in responsive grid with pagination
 */
export const DeviceGrid = ({
  devices = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  if (loading) {
    return <LoadingScreen message="Cargando dispositivos..." />;
  }

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        title="No se encontraron dispositivos"
        description="Intenta ajustar los filtros para ver más resultados"
      />
    );
  }

  return (
    <Box>
      {/* Device Grid */}
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={device._id || device.id}>
            <DeviceCard device={device} />
          </Grid>
        ))}
      </Grid>

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

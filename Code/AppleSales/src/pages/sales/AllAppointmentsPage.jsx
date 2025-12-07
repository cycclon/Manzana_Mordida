import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  IconButton,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { appointmentsAPI } from '../../api/appointments';
import { branchesAPI } from '../../api/branches';
import { useAuth } from '../../hooks/useAuth';

const ESTADO_COLORS = {
  Solicitada: 'warning',
  Confirmada: 'info',
  Cancelada: 'error',
  Reprogramada: 'secondary',
};

const AllAppointmentsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [branches, setBranches] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    fechaDesde: null,
    fechaHasta: null,
    estado: '',
    vendedor: '',
  });

  // Appointment detail dialog
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    appointment: null,
  });

  useEffect(() => {
    fetchBranches();
    fetchAppointments();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchesAPI.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Build date range (default to current month if not specified)
      const fechaDesde = filters.fechaDesde
        ? format(filters.fechaDesde, 'yyyy-MM-dd')
        : format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

      const fechaHasta = filters.fechaHasta
        ? format(filters.fechaHasta, 'yyyy-MM-dd')
        : format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');

      // Fetch appointments with optional vendedor filter
      const data = await appointmentsAPI.getAppointmentsByRange(
        fechaDesde,
        fechaHasta,
        filters.vendedor || null
      );

      // Filter by estado if specified
      let filtered = data;
      if (filters.estado) {
        filtered = data.filter(apt => apt.estado === filters.estado);
      }

      setAppointments(filtered);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchAppointments();
  };

  const handleClearFilters = () => {
    setFilters({
      fechaDesde: null,
      fechaHasta: null,
      estado: '',
      vendedor: '',
    });
    // Fetch with cleared filters
    setTimeout(() => fetchAppointments(), 0);
  };

  const handleOpenDetail = (appointment) => {
    setDetailDialog({ open: true, appointment });
  };

  const handleCloseDetail = () => {
    setDetailDialog({ open: false, appointment: null });
  };

  const getBranchDetails = (branchId) => {
    return branches.find(b => b._id === branchId) || null;
  };

  const formatAddress = (direccion) => {
    if (!direccion) return 'N/A';

    const parts = [];
    if (direccion.calle) parts.push(direccion.calle);
    if (direccion.altura) parts.push(direccion.altura);

    let address = parts.join(' ');

    if (direccion.piso) {
      address += `, Piso ${direccion.piso}`;
    }
    if (direccion.departamento) {
      address += `, Depto ${direccion.departamento}`;
    }

    return address || 'N/A';
  };

  const getAppointmentTimeLabel = (appointment) => {
    if (!appointment.horaInicio) return 'Sin hora';

    const startHour = appointment.horaInicio;
    const duration = appointment.duracion || 1;

    // Calculate end time
    const endTimeInHours = startHour + duration;
    const endHour = Math.floor(endTimeInHours);
    const endMinutes = Math.round((endTimeInHours - endHour) * 60);

    // Format times
    const startTime = `${startHour}:00`;
    const endTime = `${endHour}:${endMinutes.toString().padStart(2, '0')}`;

    return `${startTime} - ${endTime}`;
  };

  if (loading && appointments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center">
          <EventNoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Todas las Citas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vista global de todas las citas del sistema
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAppointments}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Desde"
                value={filters.fechaDesde}
                onChange={(newValue) => handleFilterChange('fechaDesde', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Hasta"
                value={filters.fechaHasta}
                onChange={(newValue) => handleFilterChange('fechaHasta', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
                minDate={filters.fechaDesde}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Solicitada">Solicitada</MenuItem>
                <MenuItem value="Confirmada">Confirmada</MenuItem>
                <MenuItem value="Cancelada">Cancelada</MenuItem>
                <MenuItem value="Reprogramada">Reprogramada</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
            <TextField
              label="Vendedor"
              value={filters.vendedor}
              onChange={(e) => handleFilterChange('vendedor', e.target.value)}
              placeholder="Filtrar por vendedor"
              fullWidth
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 'auto' }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={loading}
              fullWidth
            >
              Aplicar
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 'auto' }}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              disabled={loading}
              fullWidth
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointments Table */}
      <Paper sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                {!isMobile && <TableCell>Hora</TableCell>}
                <TableCell>Cliente</TableCell>
                {!isTablet && <TableCell>Email</TableCell>}
                {!isTablet && <TableCell>Teléfono</TableCell>}
                {!isMobile && <TableCell>Vendedor</TableCell>}
                {!isTablet && <TableCell>Sucursal</TableCell>}
                <TableCell>Estado</TableCell>
                {!isMobile && <TableCell>Canje</TableCell>}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 4 : isTablet ? 6 : 10} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 4 : isTablet ? 6 : 10} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron citas con los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => {
                  const branch = getBranchDetails(appointment.sucursal);
                  return (
                    <TableRow key={appointment._id} hover>
                      <TableCell>
                        {format(parseISO(appointment.fecha), isMobile ? 'dd/MM' : 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          {getAppointmentTimeLabel(appointment)}
                        </TableCell>
                      )}
                      <TableCell>{appointment.cliente?.nombre || 'N/A'}</TableCell>
                      {!isTablet && <TableCell>{appointment.cliente?.email || 'N/A'}</TableCell>}
                      {!isTablet && <TableCell>{appointment.cliente?.telefono || 'N/A'}</TableCell>}
                      {!isMobile && (
                        <TableCell>
                          {appointment.vendedor || <em style={{ color: '#999' }}>Sin asignar</em>}
                        </TableCell>
                      )}
                      {!isTablet && (
                        <TableCell>
                          {branch ? `${branch.barrio}, ${branch.localidad}` : 'N/A'}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={appointment.estado}
                          color={ESTADO_COLORS[appointment.estado] || 'default'}
                          size="small"
                        />
                        {appointment.estado === 'Solicitada' && appointment.reprogramada && (
                          <Chip
                            label="Reprog."
                            color="info"
                            size="small"
                            sx={{ ml: 0.5 }}
                          />
                        )}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          {appointment.cliente?.canje ? (
                            <Chip label="Sí" color="secondary" size="small" />
                          ) : (
                            <Chip label="No" variant="outlined" size="small" />
                          )}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetail(appointment)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination info */}
        {appointments.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {appointments.length} cita{appointments.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Appointment Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Detalles de la Cita
        </DialogTitle>
        <DialogContent>
          {detailDialog.appointment && (
            <Box>
              {/* Show alert if it's a rescheduled appointment */}
              {detailDialog.appointment.estado === 'Reprogramada' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Esta cita fue reprogramada.
                </Alert>
              )}
              {detailDialog.appointment.estado === 'Solicitada' && detailDialog.appointment.reprogramada && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Esta cita proviene de una reprogramación.
                </Alert>
              )}

              {/* Appointment Date and Time */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom color="primary">
                  Fecha y Hora
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha:</strong> {format(parseISO(detailDialog.appointment.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Hora:</strong> {getAppointmentTimeLabel(detailDialog.appointment)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Duración:</strong> {detailDialog.appointment.duracion}h
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={detailDialog.appointment.estado}
                    color={ESTADO_COLORS[detailDialog.appointment.estado] || 'default'}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Client Information */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom color="primary">
                  Cliente
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Nombre:</strong> {detailDialog.appointment.cliente?.nombre || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {detailDialog.appointment.cliente?.email || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Teléfono:</strong> {detailDialog.appointment.cliente?.telefono || 'N/A'}
                </Typography>
              </Box>

              {/* Seller Information */}
              {detailDialog.appointment.vendedor && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Vendedor
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {detailDialog.appointment.vendedor}
                  </Typography>
                </Box>
              )}

              {/* Branch Information */}
              {getBranchDetails(detailDialog.appointment.sucursal) && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Sucursal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {(() => {
                    const branch = getBranchDetails(detailDialog.appointment.sucursal);
                    return (
                      <>
                        <Typography variant="body1" gutterBottom>
                          <strong>Barrio:</strong> {branch.barrio}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Dirección:</strong> {formatAddress(branch.direccion)}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Localidad:</strong> {branch.localidad}, {branch.provincia}
                        </Typography>
                        {branch.googleMaps && (
                          <Box mt={2}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<MapIcon />}
                              href={branch.googleMaps}
                              target="_blank"
                              rel="noopener noreferrer"
                              fullWidth
                            >
                              Ver en Google Maps
                            </Button>
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Box>
              )}

              {/* Trade-in Information */}
              {detailDialog.appointment.cliente?.canje && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Dispositivo a Canjear
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    <strong>Línea:</strong> {detailDialog.appointment.cliente.canje.linea}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Modelo:</strong> {detailDialog.appointment.cliente.canje.modelo}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Batería:</strong> {(detailDialog.appointment.cliente.canje.bateria * 100).toFixed(0)}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllAppointmentsPage;

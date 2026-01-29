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
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CardActionArea,
  IconButton,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PointOfSale as PointOfSaleIcon,
  EventNote as EventNoteIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ViewList as ViewListIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { appointmentsAPI } from '../../api/appointments';
import { reservationsAPI } from '../../api/reservations';
import { schedulesAPI } from '../../api/schedules';
import { branchesAPI } from '../../api/branches';
import { useAuth } from '../../hooks/useAuth';
import { format, isToday, isTomorrow, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { gradientTextSilver } from '../../theme';
import { parseLocalDate } from '../../utils/helpers';

const ESTADO_COLORS = {
  Solicitada: 'warning',
  Confirmada: 'info',
  Completada: 'success',
  Cancelada: 'error',
  Vencida: 'error',
  Pagada: 'success',
  Reprogramada: 'secondary',
};

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DAY_ORDER = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
  'Domingo': 7
};

export const SalesDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingReservations: 0,
    completedToday: 0,
  });
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday
  const [weekAppointments, setWeekAppointments] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    nuevaFecha: null,
    nuevaHora: 9,
  });

  // Availability management state
  const [schedules, setSchedules] = useState([]);
  const [branches, setBranches] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [addScheduleDialogOpen, setAddScheduleDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    sucursal: '',
    diasSemana: [],
    horaInicio: 9,
    horaFinal: 17,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedWeekStart]);

  useEffect(() => {
    fetchSchedulesAndBranches();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const weekStart = selectedWeekStart;
      const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });

      // Fetch appointments for the week range
      const fechaDesde = format(weekStart, 'yyyy-MM-dd');
      const fechaHasta = format(weekEnd, 'yyyy-MM-dd');

      // Fetch appointments for date range (authenticated endpoint with full details)
      const appointmentsData = await appointmentsAPI.getAppointmentsByRange(fechaDesde, fechaHasta);
      const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : [];

      // Sort by date and time
      const sortedAppts = appointmentsArray.sort((a, b) => {
        const dateCompare = new Date(a.fecha) - new Date(b.fecha);
        if (dateCompare !== 0) return dateCompare;
        return (a.horaInicio || 0) - (b.horaInicio || 0);
      });
      setWeekAppointments(sortedAppts);

      // Fetch reservations
      const reservationsData = await reservationsAPI.getAllReservations();
      const reservations = reservationsData.data || reservationsData || [];

      // Filter pending reservations (Solicitada or Confirmada)
      const pending = reservations.filter(r =>
        r.estado === 'Solicitada' || r.estado === 'Confirmada'
      ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setUpcomingReservations(pending.slice(0, 5)); // Show top 5

      // Calculate stats for the week
      const completedThisWeek = appointmentsArray.filter(apt => apt.estado === 'Completada').length;
      const todayAppts = appointmentsArray.filter(apt => isToday(parseLocalDate(apt.fecha))).length;

      setStats({
        todayAppointments: todayAppts,
        pendingReservations: pending.length,
        completedToday: completedThisWeek,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setSelectedWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeekStart(prev => addWeeks(prev, 1));
  };

  const handleThisWeek = () => {
    setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const fetchSchedulesAndBranches = async () => {
    try {
      setSchedulesLoading(true);

      // Fetch user's schedules
      if (user?.username) {
        const userSchedules = await schedulesAPI.getSchedulesBySeller(user.username);
        console.log('User schedules response:', userSchedules);
        setSchedules(userSchedules || []);
      }

      // Fetch branches for selection
      console.log('Fetching branches...');
      const branchesData = await branchesAPI.getAllBranches();
      console.log('Branches raw response:', branchesData);
      console.log('Is array?', Array.isArray(branchesData));
      console.log('Type:', typeof branchesData);

      const branchesArray = Array.isArray(branchesData) ? branchesData : [];
      console.log('Branches array:', branchesArray);
      setBranches(branchesArray);

      if (branchesArray.length === 0) {
        console.warn('No hay sucursales registradas. Ve a la página de administración para agregar sucursales primero.');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.sucursal || newSchedule.diasSemana.length === 0) {
      alert('Por favor selecciona una sucursal y al menos un día');
      return;
    }

    try {
      setSchedulesLoading(true);
      await schedulesAPI.createMultipleSchedules({
        vendedor: user.username,
        ...newSchedule,
      });

      // Refresh schedules
      await fetchSchedulesAndBranches();

      // Reset form
      setNewSchedule({
        sucursal: '',
        diasSemana: [],
        horaInicio: 9,
        horaFinal: 17,
      });
      setAddScheduleDialogOpen(false);
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert(error.response?.data?.message || 'Error al agregar horario');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) {
      return;
    }

    try {
      setSchedulesLoading(true);
      await schedulesAPI.deleteSchedule(scheduleId);
      await fetchSchedulesAndBranches();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error al eliminar horario');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setNewSchedule(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(day)
        ? prev.diasSemana.filter(d => d !== day)
        : [...prev.diasSemana, day],
    }));
  };

  const getBranchLabel = (sucursalId) => {
    const branch = branches.find(b => b._id === sucursalId);
    if (!branch) return sucursalId; // Fallback to ID if not found
    return `${branch.barrio}, ${branch.localidad} - ${branch.provincia}`;
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

  const getDateLabel = (fecha) => {
    if (!fecha) return '-';
    const date = typeof fecha === 'string' ? parseLocalDate(fecha) : fecha;

    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';

    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  const handleOpenReservationDetail = (reserva) => {
    setSelectedReservation(reserva);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleConfirmReservation = async () => {
    if (!selectedReservation) return;

    try {
      setActionLoading(true);
      await reservationsAPI.confirmReservation(selectedReservation._id);
      handleCloseDetail();
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error confirming reservation:', error);
      alert(error.response?.data?.message || 'Error al confirmar la reserva');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    const motivo = prompt('Motivo de cancelación:');
    if (!motivo) return;

    try {
      setActionLoading(true);
      await reservationsAPI.cancelReservation(selectedReservation._id, { motivoCancelacion: motivo });
      handleCloseDetail();
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error canceling reservation:', error);
      alert(error.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteReservation = async () => {
    if (!selectedReservation) return;

    if (!window.confirm('¿Confirmás que el cliente ha pagado el resto y retirado el dispositivo? Esto marcará el dispositivo como vendido.')) {
      return;
    }

    try {
      setActionLoading(true);
      // Complete the reservation - this will mark device as sold
      await reservationsAPI.completeReservation(selectedReservation._id, {
        pagoFinal: 0, // Can be enhanced to ask for amount
        metodoPago: 'Efectivo' // Can be enhanced to ask for payment method
      });
      handleCloseDetail();
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error completing reservation:', error);
      alert(error.response?.data?.message || 'Error al completar la reserva');
    } finally {
      setActionLoading(false);
    }
  };

  // Appointment handlers
  const handleOpenAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleCloseAppointmentDetail = () => {
    setAppointmentDialogOpen(false);
    setSelectedAppointment(null);
    setRescheduleDialogOpen(false);
    setRescheduleData({ nuevaFecha: null, nuevaHora: 9 });
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      await appointmentsAPI.confirmAppointment(selectedAppointment._id);
      handleCloseAppointmentDetail();
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert(error.response?.data?.message || 'Error al confirmar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    const motivo = prompt('Motivo de cancelación:');
    if (!motivo) return;

    try {
      setActionLoading(true);
      await appointmentsAPI.cancelAppointment(selectedAppointment._id, { motivo });
      handleCloseAppointmentDetail();
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert(error.response?.data?.message || 'Error al cancelar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRescheduleDialog = () => {
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleData.nuevaFecha || !rescheduleData.nuevaHora) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      setActionLoading(true);

      // Format date as YYYY-MM-DD for backend
      const formattedDate = format(rescheduleData.nuevaFecha, 'yyyy-MM-dd');

      console.log('Rescheduling appointment:', {
        nuevaFecha: formattedDate,
        nuevaHora: rescheduleData.nuevaHora
      });

      await appointmentsAPI.rescheduleAppointment(selectedAppointment._id, {
        nuevaFecha: formattedDate,
        nuevaHora: rescheduleData.nuevaHora
      });

      handleCloseAppointmentDetail();
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert(error.response?.data?.message || 'Error al reprogramar la cita');
    } finally {
      setActionLoading(false);
    }
  };

  const getDeviceLabel = (reserva) => {
    if (!reserva.equipo) return 'Dispositivo';

    // Handle if equipo is just an ID string
    if (typeof reserva.equipo === 'string') {
      return `ID: ${reserva.equipo.substring(0, 8)}...`;
    }

    // Handle full device object
    const parts = [];
    if (reserva.equipo.producto) {
      // producto is an object with marca, linea, modelo
      if (reserva.equipo.producto.marca) parts.push(reserva.equipo.producto.marca);
      if (reserva.equipo.producto.linea) parts.push(reserva.equipo.producto.linea);
      if (reserva.equipo.producto.modelo) parts.push(reserva.equipo.producto.modelo);
    }
    if (reserva.equipo.color && reserva.equipo.color.nombre) {
      parts.push(reserva.equipo.color.nombre);
    }

    return parts.length > 0 ? parts.join(' ') : 'Dispositivo';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={{ xs: 2, sm: 0 }} mb={4}>
        <Box display="flex" alignItems="center">
          <PointOfSaleIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' }, ...gradientTextSilver }}>
              Panel de Ventas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EventNoteIcon />}
          onClick={fetchDashboardData}
          sx={{ maxWidth: { xs: 160, sm: 'auto' }, flexShrink: 0 }}
        >
          Actualizar
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Citas de Hoy
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    {stats.todayAppointments}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: { xs: 36, md: 48 }, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reservas Pendientes
                  </Typography>
                  <Typography variant="h3" color="warning.main">
                    {stats.pendingReservations}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: { xs: 36, md: 48 }, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completadas Hoy
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {stats.completedToday}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: { xs: 36, md: 48 }, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CRM Quick Access */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
            onClick={() => navigate('/crm')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Gestión de Clientes
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    CRM
                  </Typography>
                </Box>
                <GroupsIcon sx={{ fontSize: { xs: 36, md: 48 }, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Week's Appointments */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <EventNoteIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ ...gradientTextSilver }}>
                  Agenda Semanal
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ViewListIcon />}
                onClick={() => navigate('/ventas/citas')}
              >
                Ver Todas
              </Button>
            </Box>

            {/* Week Navigator */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <IconButton onClick={handlePreviousWeek} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" fontWeight="medium">
                  {format(selectedWeekStart, 'd MMM', { locale: es })} - {format(endOfWeek(selectedWeekStart, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: es })}
                </Typography>
                <Button size="small" variant="text" onClick={handleThisWeek}>
                  Esta Semana
                </Button>
              </Box>
              <IconButton onClick={handleNextWeek} size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {weekAppointments.length === 0 ? (
              <Alert severity="info">
                No hay citas programadas para esta semana
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Hora</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weekAppointments.map((apt) => (
                      <TableRow
                        key={apt._id}
                        onClick={() => handleOpenAppointmentDetail(apt)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={isToday(parseLocalDate(apt.fecha)) ? 'bold' : 'normal'}>
                            {format(parseLocalDate(apt.fecha), 'EEE d MMM', { locale: es })}
                            {isToday(parseLocalDate(apt.fecha)) && ' (Hoy)'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={isToday(parseLocalDate(apt.fecha)) ? 'bold' : 'normal'}>
                            {getAppointmentTimeLabel(apt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {apt.cliente?.nombre || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {apt.cliente?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={apt.estado}
                              color={ESTADO_COLORS[apt.estado] || 'default'}
                              size="small"
                            />
                            {apt.estado === 'Cancelada' && apt.motivoCancelacion && (
                              <Typography variant="caption" color="error.main" sx={{ fontStyle: 'italic' }}>
                                {apt.motivoCancelacion}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Reservations */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ShoppingCartIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ ...gradientTextSilver }}>
                Reservas Pendientes
              </Typography>
            </Box>

            {upcomingReservations.length === 0 ? (
              <Alert severity="info">
                No hay reservas pendientes
              </Alert>
            ) : (
              <Box>
                {upcomingReservations.map((reserva) => (
                  <Card key={reserva._id} sx={{ mb: 2 }}>
                    <CardActionArea onClick={() => handleOpenReservationDetail(reserva)}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {getDeviceLabel(reserva)}
                          </Typography>
                          <Chip
                            label={reserva.estado}
                            color={ESTADO_COLORS[reserva.estado] || 'default'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Cliente: {reserva.usuarioCliente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fecha: {getDateLabel(reserva.fecha)}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            label={`Seña: $${reserva.sena?.monto?.toLocaleString() || '0'}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={reserva.sena?.estado || 'N/A'}
                            color={ESTADO_COLORS[reserva.sena?.estado] || 'default'}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
                {stats.pendingReservations > 5 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    +{stats.pendingReservations - 5} reservas más...
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Availability Management Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ ...gradientTextSilver }}>
              Mi Disponibilidad
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddScheduleDialogOpen(true)}
          >
            Agregar Horario
          </Button>
        </Box>

        {schedulesLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : schedules.length === 0 ? (
          <Alert severity="info">
            No has configurado tu disponibilidad. Hacé clic en "Agregar Horario" para definir cuándo podés recibir citas.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Día</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules
                  .sort((a, b) => {
                    // Sort by day of week first
                    const dayDiff = (DAY_ORDER[a.diaSemana] || 0) - (DAY_ORDER[b.diaSemana] || 0);
                    if (dayDiff !== 0) return dayDiff;
                    // Then by start time
                    return a.horaInicio - b.horaInicio;
                  })
                  .map((schedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell>{schedule.diaSemana}</TableCell>
                      <TableCell>{getBranchLabel(schedule.sucursal)}</TableCell>
                      <TableCell>
                        {schedule.horaInicio}:00 - {schedule.horaFinal}:00
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteSchedule(schedule._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Schedule Dialog */}
      <Dialog open={addScheduleDialogOpen} onClose={() => setAddScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Horario de Disponibilidad</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {branches.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                No hay sucursales registradas. Un administrador debe crear sucursales primero en la página de administración.
              </Alert>
            ) : (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={newSchedule.sucursal}
                  onChange={(e) => setNewSchedule({ ...newSchedule, sucursal: e.target.value })}
                  label="Sucursal"
                >
                  {branches.map((branch) => {
                    const branchLabel = `${branch.barrio}, ${branch.localidad} - ${branch.provincia}`;
                    return (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branchLabel}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Días de la semana
            </Typography>
            <Box sx={{ mb: 3 }}>
              {DAYS_OF_WEEK.map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={newSchedule.diasSemana.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                  }
                  label={day}
                />
              ))}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Hora Inicio"
                  value={newSchedule.horaInicio}
                  onChange={(e) => setNewSchedule({ ...newSchedule, horaInicio: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 23 }}
                  helperText="Formato 24h (0-23)"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Hora Final"
                  value={newSchedule.horaFinal}
                  onChange={(e) => setNewSchedule({ ...newSchedule, horaFinal: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 23 }}
                  helperText="Formato 24h (0-23)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddScheduleDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleAddSchedule}
            variant="contained"
            disabled={schedulesLoading}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reservation Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>
          Detalles de Reserva
        </DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {getDeviceLabel(selectedReservation)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedReservation.usuarioCliente}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getDateLabel(selectedReservation.fecha)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    label={selectedReservation.estado}
                    color={ESTADO_COLORS[selectedReservation.estado] || 'default'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Monto Seña
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${selectedReservation.sena?.monto?.toLocaleString() || '0'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estado Seña
                  </Typography>
                  <Chip
                    label={selectedReservation.sena?.estado || 'N/A'}
                    color={ESTADO_COLORS[selectedReservation.sena?.estado] || 'default'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                {selectedReservation.equipo?.precio && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Precio Total
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${selectedReservation.equipo.precio.toLocaleString()}
                    </Typography>
                  </Grid>
                )}

                {/* Device Details Section */}
                {selectedReservation.equipo && typeof selectedReservation.equipo === 'object' && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Detalles del Dispositivo
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Condición
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.equipo.condicion || 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Grado
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.equipo.grado || 'N/A'}
                      </Typography>
                    </Grid>

                    {selectedReservation.equipo.condicionBateria && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Salud de Batería
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {(selectedReservation.equipo.condicionBateria * 100).toFixed(0)}%
                        </Typography>
                      </Grid>
                    )}

                    {selectedReservation.equipo.detalles && selectedReservation.equipo.detalles.length > 0 && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Detalles
                        </Typography>
                        <Typography variant="body2">
                          {selectedReservation.equipo.detalles.join(', ')}
                        </Typography>
                      </Grid>
                    )}

                    {selectedReservation.equipo.accesorios && selectedReservation.equipo.accesorios.length > 0 && (
                      <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                          Accesorios Incluidos
                        </Typography>
                        <Typography variant="body2">
                          {selectedReservation.equipo.accesorios.join(', ')}
                        </Typography>
                      </Grid>
                    )}

                    {selectedReservation.equipo._id && (
                      <Grid size={12}>
                        <Button
                          variant="text"
                          size="small"
                          href={`/dispositivo/${selectedReservation.equipo._id}`}
                          target="_blank"
                          sx={{ mt: 1 }}
                        >
                          Ver detalles completos del dispositivo →
                        </Button>
                      </Grid>
                    )}
                  </>
                )}

                {selectedReservation.canje && (
                  <Grid size={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Canje
                    </Typography>
                    <Typography variant="body1">
                      {selectedReservation.canje.linea} {selectedReservation.canje.modelo}
                    </Typography>
                    {selectedReservation.canje.bateria && (
                      <Typography variant="body2" color="text.secondary">
                        Batería: {(selectedReservation.canje.bateria * 100).toFixed(0)}%
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>
            Cerrar
          </Button>
          {selectedReservation?.estado === 'Solicitada' && selectedReservation?.sena?.estado === 'Pagada' && (
            <Button
              onClick={handleConfirmReservation}
              variant="contained"
              color="success"
              disabled={actionLoading}
            >
              Confirmar Reserva
            </Button>
          )}
          {selectedReservation?.estado === 'Confirmada' && (
            <Button
              onClick={handleCompleteReservation}
              variant="contained"
              color="primary"
              disabled={actionLoading}
            >
              Completar Venta
            </Button>
          )}
          {(selectedReservation?.estado === 'Solicitada' || selectedReservation?.estado === 'Confirmada') && (
            <Button
              onClick={handleCancelReservation}
              variant="outlined"
              color="error"
              disabled={actionLoading}
            >
              Cancelar Reserva
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog open={appointmentDialogOpen} onClose={handleCloseAppointmentDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles de Cita
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              {/* Client Information */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom color="primary">
                  Información del Cliente
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Nombre</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedAppointment.cliente?.nombre || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedAppointment.cliente?.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedAppointment.cliente?.telefono || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Trade-in Information (if applicable) */}
              {selectedAppointment.cliente?.canje && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Dispositivo a Canjear
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">Línea</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedAppointment.cliente.canje.linea}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">Modelo</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedAppointment.cliente.canje.modelo}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">Batería</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {(selectedAppointment.cliente.canje.bateria * 100).toFixed(0)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Appointment Information */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom color="primary">
                  Información de la Cita
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Fecha</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {format(parseLocalDate(selectedAppointment.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Horario</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getAppointmentTimeLabel(selectedAppointment)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Sucursal</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {branches.find(b => b._id === selectedAppointment.sucursal)
                        ? `${branches.find(b => b._id === selectedAppointment.sucursal).barrio}, ${branches.find(b => b._id === selectedAppointment.sucursal).localidad} - ${branches.find(b => b._id === selectedAppointment.sucursal).provincia}`
                        : selectedAppointment.sucursal}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Estado</Typography>
                    <Chip
                      label={selectedAppointment.estado}
                      color={ESTADO_COLORS[selectedAppointment.estado] || 'default'}
                      size="small"
                    />
                  </Grid>
                  {selectedAppointment.estado === 'Cancelada' && selectedAppointment.motivoCancelacion && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">Motivo de Cancelación</Typography>
                      <Typography variant="body1" color="error.main" fontWeight="medium">
                        {selectedAppointment.motivoCancelacion}
                      </Typography>
                    </Grid>
                  )}
                  {selectedAppointment.vendedor && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Vendedor Asignado</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedAppointment.vendedor}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointmentDetail} disabled={actionLoading}>
            Cerrar
          </Button>
          {selectedAppointment?.estado === 'Solicitada' && !selectedAppointment?.reprogramada && (
            <>
              <Button
                onClick={handleOpenRescheduleDialog}
                variant="outlined"
                color="warning"
                disabled={actionLoading}
              >
                Reprogramar
              </Button>
              <Button
                onClick={handleConfirmAppointment}
                variant="contained"
                color="success"
                disabled={actionLoading}
              >
                Confirmar Cita
              </Button>
            </>
          )}
          {(selectedAppointment?.estado === 'Solicitada' || selectedAppointment?.estado === 'Confirmada') && (
            <Button
              onClick={handleCancelAppointment}
              variant="outlined"
              color="error"
              disabled={actionLoading}
            >
              Cancelar Cita
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reprogramar Cita</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              El cliente recibirá la nueva fecha propuesta y deberá confirmarla o cancelarla.
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Nueva Fecha"
                value={rescheduleData.nuevaFecha}
                onChange={(newValue) => setRescheduleData({ ...rescheduleData, nuevaFecha: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                  },
                }}
                minDate={new Date()}
              />
            </LocalizationProvider>
            <FormControl fullWidth margin="normal">
              <InputLabel>Nueva Hora</InputLabel>
              <Select
                value={rescheduleData.nuevaHora}
                onChange={(e) => setRescheduleData({ ...rescheduleData, nuevaHora: e.target.value })}
                label="Nueva Hora"
              >
                {Array.from({ length: 13 }, (_, i) => i + 9).map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour}:00
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleRescheduleAppointment}
            variant="contained"
            color="primary"
            disabled={actionLoading}
          >
            Reprogramar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalesDashboard;

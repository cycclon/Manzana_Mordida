import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Link,
} from '@mui/material';
import {
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  ShoppingCart as ShoppingCartIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { customersAPI } from '../../api/customers';
import { reservationsAPI } from '../../api/reservations';
import { appointmentsAPI } from '../../api/appointments';
import { branchesAPI } from '../../api/branches';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADO_COLORS = {
  Solicitada: 'warning',
  Confirmada: 'info',
  Completada: 'success',
  Cancelada: 'error',
  Vencida: 'error',
  Pagada: 'success',
  Reprogramada: 'secondary',
};

/**
 * ProfilePage - Customer profile with personal info, reservations, and appointments
 */
const ProfilePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Read initial tab from URL params (default to 0)
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Customer data
  const [customerData, setCustomerData] = useState(null);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    whatsapp: '',
  });

  // Reservations data
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Appointments data
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Branches data
  const [branches, setBranches] = useState([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Payment upload dialog state
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    reservationId: null,
  });
  const [paymentFile, setPaymentFile] = useState(null);

  // Appointment detail dialog state
  const [appointmentDetailDialog, setAppointmentDetailDialog] = useState({
    open: false,
    appointment: null,
  });

  // Fetch customer data on mount
  useEffect(() => {
    if (user?.username) {
      fetchCustomerData();
    }
  }, [user]);

  // Fetch reservations when tab changes to reservations
  useEffect(() => {
    if (activeTab === 1 && reservations.length === 0) {
      fetchReservations();
    }
  }, [activeTab]);

  // Fetch appointments when tab changes to appointments
  useEffect(() => {
    if (activeTab === 2 && appointments.length === 0 && customerData?.email) {
      fetchAppointments();
    }
  }, [activeTab, customerData]);

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.getCustomerByUsername(user.username);
      setCustomerData(data);
      setFormData({
        email: data.email || '',
        whatsapp: data.whatsapp || '',
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // If customer record doesn't exist (404), keep customerData as null
      // This will show the "complete profile" message instead of error
      if (error.response?.status === 404) {
        setCustomerData(null);
      } else {
        showSnackbar('Error al cargar datos del perfil', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);
      const response = await reservationsAPI.getMyReservations();
      setReservations(response.data || response || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showSnackbar('Error al cargar reservas', 'error');
    } finally {
      setLoadingReservations(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const data = await appointmentsAPI.getMyAppointments(customerData.email);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showSnackbar('Error al cargar citas', 'error');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchesAPI.getAllBranches();
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const getBranchLabel = (branchId) => {
    const branch = branches.find(b => b._id === branchId);
    if (branch) {
      return `${branch.barrio}, ${branch.localidad} - ${branch.provincia}`;
    }
    return branchId || 'N/A';
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProfile = async () => {
    // Validate required fields
    if (!formData.nombres || !formData.apellidos || !formData.email) {
      showSnackbar('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    try {
      await customersAPI.createCustomer({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        whatsapp: formData.whatsapp,
        usuario: user.username,
      });
      showSnackbar('Perfil creado exitosamente');
      fetchCustomerData(); // Refresh to load new customer data
    } catch (error) {
      console.error('Error creating profile:', error);
      showSnackbar(error.response?.data?.message || 'Error al crear perfil', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!customerData?._id) {
      showSnackbar('No se pudo identificar el cliente', 'error');
      return;
    }

    try {
      await customersAPI.updateCustomer(customerData._id, formData);
      showSnackbar('Perfil actualizado exitosamente');
      fetchCustomerData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar(error.response?.data?.message || 'Error al actualizar perfil', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate remaining time for payment
  const calculateRemainingTime = useCallback((fechaVencimiento) => {
    if (!fechaVencimiento) return null;

    const now = new Date();
    const expiry = new Date(fechaVencimiento);
    const diff = expiry - now;

    if (diff <= 0) return 'Vencido';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Auto-refresh reservations every 10 seconds to update timers
  useEffect(() => {
    if (activeTab === 1 && reservations.length > 0) {
      const interval = setInterval(() => {
        // Force re-render to update timers
        setReservations([...reservations]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTab, reservations]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await reservationsAPI.cancelReservation(reservationId, { motivoCancelacion: 'Cancelado por el cliente' });
      showSnackbar('Reserva cancelada exitosamente');
      fetchReservations(); // Refresh
    } catch (error) {
      console.error('Error canceling reservation:', error);
      showSnackbar(error.response?.data?.message || 'Error al cancelar reserva', 'error');
    }
  };

  const handleOpenPaymentDialog = (reservationId) => {
    setPaymentDialog({ open: true, reservationId });
    setPaymentFile(null);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialog({ open: false, reservationId: null });
    setPaymentFile(null);
  };

  const handleUploadPayment = async () => {
    if (!paymentFile) {
      showSnackbar('Por favor selecciona un archivo', 'error');
      return;
    }

    try {
      await reservationsAPI.uploadPaymentProof(paymentDialog.reservationId, paymentFile);
      showSnackbar('Comprobante subido exitosamente');
      handleClosePaymentDialog();
      fetchReservations(); // Refresh
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      showSnackbar(error.response?.data?.message || 'Error al subir comprobante', 'error');
    }
  };

  const handleOpenAppointmentDetail = (appointment) => {
    setAppointmentDetailDialog({ open: true, appointment });
  };

  const handleCloseAppointmentDetail = () => {
    setAppointmentDetailDialog({ open: false, appointment: null });
  };

  const handleAcceptAppointment = async () => {
    if (!appointmentDetailDialog.appointment || !customerData?.email) return;

    if (!window.confirm('¿Aceptar esta nueva fecha y hora propuesta?')) {
      return;
    }

    try {
      setLoading(true);
      await appointmentsAPI.acceptAppointment(
        appointmentDetailDialog.appointment._id,
        customerData.email
      );
      setSnackbar({
        open: true,
        message: 'Cita confirmada exitosamente.',
        severity: 'success'
      });
      handleCloseAppointmentDetail();
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error('Error accepting appointment:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al aceptar la cita',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentDetailDialog.appointment) return;

    const motivo = prompt('Motivo de cancelación (opcional):');
    if (motivo === null) return; // User clicked cancel

    try {
      setLoading(true);
      await appointmentsAPI.cancelAppointment(appointmentDetailDialog.appointment._id, {
        motivo: motivo || 'Sin especificar'
      });
      setSnackbar({
        open: true,
        message: 'Cita cancelada exitosamente',
        severity: 'success'
      });
      handleCloseAppointmentDetail();
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cancelar la cita',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  const getDeviceLabel = (equipo) => {
    if (!equipo) return 'N/A';

    // If equipo is just a string ID
    if (typeof equipo === 'string') {
      return `ID: ${equipo.substring(0, 8)}...`;
    }

    // If equipo is populated with full details
    const parts = [];
    if (equipo.producto) {
      if (equipo.producto.marca) parts.push(equipo.producto.marca);
      if (equipo.producto.linea) parts.push(equipo.producto.linea);
      if (equipo.producto.modelo) parts.push(equipo.producto.modelo);
    }
    if (equipo.color && equipo.color.nombre) {
      parts.push(equipo.color.nombre);
    }

    return parts.length > 0 ? parts.join(' ') : 'Dispositivo';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show profile completion form if customer record doesn't exist
  if (!customerData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Completá tu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Para poder usar todas las funciones de la plataforma, por favor completá tu perfil
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información Personal
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombres"
                value={formData.nombres || ''}
                onChange={(e) => handleFormChange('nombres', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Apellidos"
                value={formData.apellidos || ''}
                onChange={(e) => handleFormChange('apellidos', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFormChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="WhatsApp"
                value={formData.whatsapp || ''}
                onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                placeholder="+54 9 11 1234-5678"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreateProfile}
            >
              Creá tu Perfil
            </Button>
          </Box>
        </Paper>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mi Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona tu información personal, reservas y citas
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<PersonIcon />} label="Información Personal" />
          <Tab icon={<ShoppingCartIcon />} label="Mis Reservas" />
          <Tab icon={<EventNoteIcon />} label="Mis Citas" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información Personal
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombres"
                value={customerData.nombres || ''}
                disabled
                helperText="Este campo no es editable"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Apellidos"
                value={customerData.apellidos || ''}
                disabled
                helperText="Este campo no es editable"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Usuario"
                value={customerData.usuario || ''}
                disabled
                helperText="Este campo no es editable"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                placeholder="+54 9 11 1234-5678"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
            >
              Guardar Cambios
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Mis Reservas</Typography>
            <Button variant="outlined" size="small" onClick={fetchReservations}>
              Actualizar
            </Button>
          </Box>

          {loadingReservations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : reservations.length === 0 ? (
            <Alert severity="info">No tenés reservas registradas</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Equipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Seña</TableCell>
                    <TableCell>Estado Seña</TableCell>
                    <TableCell>Tiempo Restante</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reserva) => {
                    const remainingTime = reserva.sena?.fechaVencimiento && reserva.sena?.estado === 'Solicitada'
                      ? calculateRemainingTime(reserva.sena.fechaVencimiento)
                      : null;
                    const isExpired = remainingTime === 'Vencido' || reserva.sena?.estado === 'Vencida';
                    const isPaid = reserva.sena?.estado === 'Pagada' || reserva.sena?.estado === 'Confirmada';
                    const canTakeAction = reserva.sena?.estado === 'Solicitada' && !isExpired;

                    return (
                      <TableRow key={reserva._id}>
                        <TableCell>
                          {reserva.fecha ? format(new Date(reserva.fecha), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {getDeviceLabel(reserva.equipo)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reserva.estado}
                            color={ESTADO_COLORS[reserva.estado] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          ${reserva.sena?.monto?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reserva.sena?.estado || 'N/A'}
                            color={ESTADO_COLORS[reserva.sena?.estado] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {remainingTime ? (
                            <Typography
                              variant="body2"
                              color={isExpired ? 'error' : remainingTime.startsWith('0:') ? 'warning.main' : 'text.primary'}
                              fontWeight={isExpired ? 'bold' : 'normal'}
                            >
                              {remainingTime}
                            </Typography>
                          ) : isPaid ? (
                            <Typography variant="body2" color="success.main">
                              Pagado
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {reserva.estado === 'Solicitada' && canTakeAction && (
                              <>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<UploadIcon />}
                                  onClick={() => handleOpenPaymentDialog(reserva._id)}
                                >
                                  Pagar Seña
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<CancelIcon />}
                                  onClick={() => handleCancelReservation(reserva._id)}
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                            {reserva.estado === 'Solicitada' && (isPaid || isExpired) && (
                              <Typography variant="body2" color="text.secondary">
                                {isPaid ? 'Pago enviado - Esperando confirmación' : 'Reserva vencida'}
                              </Typography>
                            )}
                            {reserva.estado === 'Confirmada' && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelReservation(reserva._id)}
                              >
                                Cancelar
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Mis Citas</Typography>
            <Button variant="outlined" size="small" onClick={fetchAppointments}>
              Actualizar
            </Button>
          </Box>

          {loadingAppointments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : appointments.length === 0 ? (
            <Alert severity="info">No tenés citas registradas</Alert>
          ) : (
            <Grid container spacing={2}>
              {appointments.map((cita) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cita._id}>
                  <Card>
                    <CardActionArea onClick={() => handleOpenAppointmentDetail(cita)}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {cita.fecha ? format(new Date(cita.fecha), 'dd/MM/yyyy') : 'Fecha N/A'}
                          </Typography>
                          <Chip
                            label={cita.estado}
                            color={ESTADO_COLORS[cita.estado] || 'default'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Hora: {cita.horaInicio ? `${cita.horaInicio}:00` : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sucursal: {getBranchLabel(cita.sucursal)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duración: {cita.duracion ? `${cita.duracion}h` : 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {cita.cliente?.canje && (
                            <Chip
                              label="Con canje"
                              color="secondary"
                              size="small"
                            />
                          )}
                          {cita.estado === 'Solicitada' && cita.reprogramada && (
                            <Chip
                              label="Nueva fecha propuesta"
                              color="info"
                              size="small"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Payment Upload Dialog */}
      <Dialog open={paymentDialog.open} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Comprobante de Pago</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Por favor, selecciona el comprobante de pago de la seña. Formatos aceptados: JPG, PNG, PDF.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              {paymentFile ? paymentFile.name : 'Seleccioná Archivo'}
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancelar</Button>
          <Button
            onClick={handleUploadPayment}
            variant="contained"
            disabled={!paymentFile}
          >
            Subir Comprobante
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog
        open={appointmentDetailDialog.open}
        onClose={handleCloseAppointmentDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Detalles de la Cita
        </DialogTitle>
        <DialogContent>
          {appointmentDetailDialog.appointment && (
            <Box>
              {/* Show alert if appointment is rescheduled or if it's a new rescheduled appointment */}
              {appointmentDetailDialog.appointment.estado === 'Reprogramada' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Esta cita fue reprogramada. El vendedor ha propuesto una nueva fecha y hora.
                </Alert>
              )}
              {appointmentDetailDialog.appointment.estado === 'Solicitada' && appointmentDetailDialog.appointment.reprogramada && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Esta es la nueva fecha propuesta por el vendedor. Puedes aceptarla o cancelarla.
                </Alert>
              )}

              {/* Appointment Date and Time */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom color="primary">
                  Fecha y Hora
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha:</strong> {format(new Date(appointmentDetailDialog.appointment.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Hora:</strong> {appointmentDetailDialog.appointment.horaInicio}:00
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Duración:</strong> {appointmentDetailDialog.appointment.duracion}h
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={appointmentDetailDialog.appointment.estado}
                    color={ESTADO_COLORS[appointmentDetailDialog.appointment.estado] || 'default'}
                    size="small"
                  />
                </Box>
                {appointmentDetailDialog.appointment.estado === 'Cancelada' && appointmentDetailDialog.appointment.motivoCancelacion && (
                  <Box mt={2}>
                    <Alert severity="error">
                      <Typography variant="body2">
                        <strong>Motivo de cancelación:</strong> {appointmentDetailDialog.appointment.motivoCancelacion}
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>

              {/* Branch Information */}
              {getBranchDetails(appointmentDetailDialog.appointment.sucursal) && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Ubicación
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {(() => {
                    const branch = getBranchDetails(appointmentDetailDialog.appointment.sucursal);
                    return (
                      <>
                        <Typography variant="body1" gutterBottom>
                          <strong>Sucursal:</strong> {branch.barrio}
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

              {/* Trade-in Information (if applicable) */}
              {appointmentDetailDialog.appointment.cliente?.canje && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Dispositivo a Canjear
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    <strong>Línea:</strong> {appointmentDetailDialog.appointment.cliente.canje.linea}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Modelo:</strong> {appointmentDetailDialog.appointment.cliente.canje.modelo}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Batería:</strong> {(appointmentDetailDialog.appointment.cliente.canje.bateria * 100).toFixed(0)}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {appointmentDetailDialog.appointment && appointmentDetailDialog.appointment.estado === 'Solicitada' && (
            <>
              {/* Show "Accept" button if this appointment came from a reschedule */}
              {appointmentDetailDialog.appointment.reprogramada && (
                <Button
                  onClick={handleAcceptAppointment}
                  variant="contained"
                  color="success"
                  disabled={loading}
                  sx={{ mr: 'auto' }}
                >
                  Aceptar Nueva Fecha
                </Button>
              )}
              <Button
                onClick={handleCancelAppointment}
                color="error"
                disabled={loading}
              >
                Cancelar Cita
              </Button>
            </>
          )}
          <Button onClick={handleCloseAppointmentDetail} disabled={loading}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;

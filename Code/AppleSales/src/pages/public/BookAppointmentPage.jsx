import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { appointmentsAPI } from '../../api/appointments';
import { branchesAPI } from '../../api/branches';
import { productsAPI } from '../../api/products';
import { customersAPI } from '../../api/customers';
import { useTradeIn } from '../../hooks/useTradeIn';
import { useAuth } from '../../hooks/useAuth';

const steps = ['Información de Contacto', 'Seleccionar Sucursal y Fecha', 'Confirmar Cita'];

export const BookAppointmentPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { tradeInDevice } = useTradeIn();
  const { user, isAuthenticated, isViewer } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState(null);
  const [branches, setBranches] = useState([]);
  const [horarios, setHorarios] = useState([]); // Available time windows from admin/sales
  const [horariosLoading, setHorariosLoading] = useState(false); // Loading state for horarios
  const [occupiedSlots, setOccupiedSlots] = useState([]); // Booked appointments

  // Form data
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    sucursal: '',
    fecha: null,
    horaInicio: '',
  });

  // Load device details if deviceId is provided
  useEffect(() => {
    if (deviceId) {
      const fetchDevice = async () => {
        try {
          const deviceData = await productsAPI.getDeviceById(deviceId);
          setDevice(deviceData);
        } catch (error) {
          console.error('Error fetching device:', error);
          toast.error('No se pudo cargar el dispositivo');
        }
      };
      fetchDevice();
    }
  }, [deviceId]);

  // Load customer data if user is a logged-in viewer
  useEffect(() => {
    if (isAuthenticated && isViewer && user?.username) {
      const fetchCustomerData = async () => {
        try {
          const customerData = await customersAPI.getCustomerByUsername(user.username);

          // Autofill form with customer data
          setFormData(prev => ({
            ...prev,
            nombre: `${customerData.nombres} ${customerData.apellidos}`,
            email: customerData.email || '',
            telefono: customerData.whatsapp || '',
          }));
        } catch (error) {
          // If customer doesn't exist, that's okay - user can fill manually
        }
      };
      fetchCustomerData();
    }
  }, [isAuthenticated, isViewer, user]);

  // Load branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesData = await branchesAPI.getAllBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('No se pudo cargar las sucursales');
      }
    };
    fetchBranches();
  }, []);

  // Load horarios (time windows) when branch is selected
  useEffect(() => {
    if (formData.sucursal) {
      const fetchHorarios = async () => {
        setHorariosLoading(true);
        try {
          const horariosData = await appointmentsAPI.getHorariosBySucursal(formData.sucursal);
          setHorarios(horariosData);
        } catch (error) {
          console.error('Error fetching horarios:', error);
          setHorarios([]);
        } finally {
          setHorariosLoading(false);
        }
      };
      fetchHorarios();
    } else {
      setHorarios([]);
    }
  }, [formData.sucursal]);

  // Load occupied slots when branch and date are selected
  useEffect(() => {
    if (formData.sucursal && formData.fecha) {
      const fetchOccupiedSlots = async () => {
        try {
          const fechaStr = formData.fecha.toISOString().split('T')[0];
          const slots = await appointmentsAPI.getAvailableSlots(fechaStr, formData.sucursal);
          setOccupiedSlots(slots);
        } catch (error) {
          console.error('Error fetching occupied slots:', error);
          setOccupiedSlots([]);
        }
      };
      fetchOccupiedSlots();
    }
  }, [formData.sucursal, formData.fecha]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.nombre || !formData.telefono) {
        toast.error('Por favor completa tu nombre y teléfono');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.sucursal || !formData.fecha || !formData.horaInicio) {
        toast.error('Por favor selecciona sucursal, fecha y hora');
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Get day of week from date (matching backend format)
  const getDayOfWeek = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };

  // Check if a date should be disabled in the DatePicker
  // Returns true if NO schedules are defined for that day of the week
  const shouldDisableDate = (date) => {
    // If no branch selected or no horarios loaded yet, don't disable any dates
    if (!formData.sucursal || !horarios || horarios.length === 0) {
      return false;
    }

    const dayOfWeek = getDayOfWeek(date);

    // Check if there's at least one schedule for this day of the week
    const hasScheduleForDay = horarios.some(horario => horario.diaSemana === dayOfWeek);

    // Disable the date if there's NO schedule for that day
    return !hasScheduleForDay;
  };

  // Check if hour is within horarios time windows
  const isWithinHorarios = (hour, dayOfWeek) => {
    if (!horarios || horarios.length === 0) return false;

    return horarios.some(horario => {
      return (
        horario.diaSemana === dayOfWeek &&
        hour >= horario.horaInicio &&
        hour < horario.horaFinal
      );
    });
  };

  // Check if hour is occupied by an existing appointment
  const isHourOccupied = (hour) => {
    return occupiedSlots.some(slot => {
      const slotHour = slot.horaInicio;
      const slotDuration = slot.duracion || 0.5;
      const slotEndHour = slotHour + slotDuration;

      // Check if the hour conflicts with this slot
      return hour >= slotHour && hour < slotEndHour;
    });
  };

  // Helper function to check if a time slot is available (12 hours in advance)
  const isTimeSlotAvailable = (hour) => {
    if (!formData.fecha) return false;

    const selectedDateTime = new Date(formData.fecha);
    selectedDateTime.setHours(hour, 0, 0, 0);

    const now = new Date();
    const minDateTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now

    return selectedDateTime >= minDateTime;
  };

  // Get available hours based on horarios, occupied slots, and 12-hour requirement
  const getAvailableHours = () => {
    if (!formData.fecha || !formData.sucursal) return [];

    const dayOfWeek = getDayOfWeek(formData.fecha);

    // If no horarios defined, return empty (business not open that day)
    if (!horarios || horarios.length === 0) return [];

    // Get all possible hours (0-23)
    const allHours = Array.from({ length: 24 }, (_, i) => i);

    // Filter hours based on all criteria
    return allHours.filter(hour => {
      // Must be within horarios time windows
      if (!isWithinHorarios(hour, dayOfWeek)) return false;

      // Must not be occupied
      if (isHourOccupied(hour)) return false;

      // Must be at least 12 hours in the future
      if (!isTimeSlotAvailable(hour)) return false;

      return true;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        cliente: {
          nombre: formData.nombre,
          email: formData.email || undefined,
          telefono: formData.telefono,
          canje: tradeInDevice ? {
            linea: tradeInDevice.linea,
            modelo: tradeInDevice.modelo,
            bateria: tradeInDevice.batteryHealth / 100,
          } : undefined,
        },
        fecha: formData.fecha.toISOString(),
        sucursal: formData.sucursal,
        horaInicio: formData.horaInicio,
        duracion: 1.5,
      };

      await appointmentsAPI.requestAppointment(appointmentData);
      toast.success('Cita agendada exitosamente');

      // If user is authenticated and is a viewer, redirect to profile with appointments tab
      if (isAuthenticated && isViewer) {
        navigate('/perfil?tab=2');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Nombre Completo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email (opcional)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            {tradeInDevice && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Se incluirá tu dispositivo de canje: {tradeInDevice.modelo} ({Math.round(tradeInDevice.batteryHealth)}% batería)
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={formData.sucursal}
                  label="Sucursal"
                  onChange={(e) => setFormData({ ...formData, sucursal: e.target.value, fecha: null, horaInicio: '' })}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.localidad}, {branch.provincia} - {branch.direccion.calle} {branch.direccion.altura}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha"
                  value={formData.fecha}
                  onChange={(newValue) => setFormData({ ...formData, fecha: newValue, horaInicio: '' })}
                  minDate={new Date()}
                  shouldDisableDate={shouldDisableDate}
                  disabled={!formData.sucursal || horariosLoading}
                  loading={horariosLoading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: !formData.sucursal
                        ? 'Primero selecciona una sucursal'
                        : horariosLoading
                          ? 'Cargando disponibilidad...'
                          : horarios.length === 0
                            ? 'No hay horarios configurados para esta sucursal'
                            : 'Los días sin disponibilidad están deshabilitados'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required disabled={!formData.fecha || !formData.sucursal}>
                <InputLabel>Hora</InputLabel>
                <Select
                  value={formData.horaInicio}
                  label="Hora"
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                >
                  {getAvailableHours().map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour}:00
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formData.fecha && getAvailableHours().length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {horarios.length === 0
                    ? 'No hay horarios de atención configurados para esta sucursal.'
                    : getDayOfWeek(formData.fecha) && !horarios.some(h => h.diaSemana === getDayOfWeek(formData.fecha))
                    ? `No hay atención el día ${getDayOfWeek(formData.fecha)}.`
                    : 'No hay horarios disponibles para esta fecha. Las citas deben agendarse con al menos 12 horas de anticipación y algunos horarios ya están ocupados.'}
                </Typography>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        const selectedBranch = branches.find(b => b._id === formData.sucursal);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen de tu Cita
            </Typography>
            {device && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Dispositivo a ver: {device.producto?.modelo || device.model}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                <Typography variant="body1">{formData.nombre}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                <Typography variant="body1">{formData.telefono}</Typography>
              </Grid>
              {formData.email && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Sucursal:</Typography>
                <Typography variant="body1">
                  {selectedBranch?.localidad}, {selectedBranch?.provincia}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                <Typography variant="body1">
                  {formData.fecha?.toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Hora:</Typography>
                <Typography variant="body1">{formData.horaInicio}:00</Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Agendar Cita
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" paragraph>
          {device
            ? `Agendá una cita para ver el ${device.producto?.modelo || device.model}`
            : 'Agendá una cita para visitar nuestra sucursal'}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ my: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Atrás
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Solicitar Cita'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Siguiente
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BookAppointmentPage;

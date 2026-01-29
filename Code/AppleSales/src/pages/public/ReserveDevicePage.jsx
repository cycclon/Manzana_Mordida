import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  HourglassEmpty as HourglassIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { productsAPI } from '../../api/products';
import { bankAccountsAPI } from '../../api/bankAccounts';
import { reservationsAPI } from '../../api/reservations';
import { customersAPI } from '../../api/customers';
import { useAuth } from '../../hooks/useAuth';
import { useTradeIn } from '../../hooks/useTradeIn';
import { useCountdown } from '../../hooks/useCountdown';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { LoadingScreen } from '../../components/common';

const steps = ['Confirmar Información', 'Seleccionar Cuenta', 'Subir Comprobante'];

/**
 * ReserveDevicePage - Simplified reservation flow
 * User must be logged in. Shows device info, viewer info, location, down-payment amount, and bank accounts.
 */
export const ReserveDevicePage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isViewer } = useAuth();
  const { getAdjustedPrice, hasTradeIn, tradeInDevice } = useTradeIn();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [device, setDevice] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [reservationId, setReservationId] = useState(null);
  const [reservationAmount, setReservationAmount] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState(null);

  // Countdown timer (30 minutes from when user confirms in step 0)
  const { timeLeft, isExpired, progress } = useCountdown(timerStartTime);

  // Calculate prices
  const fullPrice = device && hasTradeIn ? getAdjustedPrice(device.precio) : device?.precio || 0;
  const modelo = device?.producto?.modelo || device?.model || 'Dispositivo';

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isViewer)) {
      toast.error('Debes iniciar sesión como cliente para hacer una reserva');
      navigate('/login');
    }
  }, [isAuthenticated, isViewer, loading, navigate]);

  // Load device details
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const deviceData = await productsAPI.getDeviceById(deviceId);
        setDevice(deviceData);

        // Check if device is available
        if (deviceData.estado === 'Reservado' || deviceData.estado === 'Vendido') {
          toast.error('Este dispositivo no está disponible');
          navigate('/dispositivos');
        }
      } catch (error) {
        console.error('Error fetching device:', error);
        toast.error('No se pudo cargar el dispositivo');
        navigate('/dispositivos');
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      fetchDevice();
    }
  }, [deviceId, navigate]);

  // Load customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (isAuthenticated && isViewer && user?.username) {
        try {
          const customer = await customersAPI.getCustomerByUsername(user.username);
          setCustomerData(customer);
        } catch (error) {
          console.error('Error fetching customer data:', error);
          toast.error('No se pudo cargar tu información de cliente');
        }
      }
    };

    fetchCustomerData();
  }, [isAuthenticated, isViewer, user]);

  // Load bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await bankAccountsAPI.getAllBankAccounts();
        const accountsArray = Array.isArray(response) ? response : (response.data || []);
        setBankAccounts(accountsArray);
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        toast.error('No se pudieron cargar las cuentas bancarias');
      }
    };

    fetchBankAccounts();
  }, []);

  // Calculate reservation amount when device/trade-in changes
  useEffect(() => {
    const calculateReservation = async () => {
      if (fullPrice > 0) {
        try {
          const response = await reservationsAPI.calculateDeposit(fullPrice);
          setReservationAmount(response.sena);
        } catch (error) {
          console.error('Error calculating deposit:', error);
          // Fallback to 20%
          setReservationAmount(fullPrice * 0.2);
        }
      }
    };

    calculateReservation();
  }, [fullPrice]);

  const handleNext = async () => {
    if (activeStep === 0) {
      // Start the 30-minute timer when confirming
      if (!timerStartTime) {
        setTimerStartTime(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate bank account selection
      if (!selectedBankAccount) {
        toast.error('Por favor selecciona una cuenta bancaria');
        return;
      }
      // Create reservation at the end of step 1
      await createReservation();
      return; // Don't proceed to next step yet - createReservation will handle it
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato de archivo no válido. Use JPG, PNG, WEBP o PDF');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      setPaymentProof(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPaymentProofPreview(null);
      }
    }
  };

  // Create reservation after step 1 (bank account selection)
  const createReservation = async () => {
    setSubmitting(true);

    try {
      const reservationData = {
        usuarioCliente: user.username,
        IdEquipo: deviceId,
        montoSena: reservationAmount,
      };

      // Include trade-in if applicable
      if (hasTradeIn && tradeInDevice) {
        reservationData.canje = {
          linea: tradeInDevice.linea,
          modelo: tradeInDevice.modelo,
          bateria: tradeInDevice.batteryHealth / 100,
        };
      }

      //console.log('Creating reservation with data:', reservationData);
      const response = await reservationsAPI.createReservation(reservationData);
      //console.log('Reservation response:', response);

      // Extract reservation ID from response (could be in response.data._id or response._id)
      const reservationIdFromResponse = response.data?._id || response._id || response.id;

      if (!reservationIdFromResponse) {
        console.error('No reservation ID in response:', response);
        throw new Error('No se pudo obtener el ID de la reserva');
      }

      setReservationId(reservationIdFromResponse);
      //console.log('Reservation ID set to:', reservationIdFromResponse);
      toast.success('Reserva creada exitosamente. Por favor sube el comprobante de pago.');

      // Move to step 2 (upload payment proof)
      setActiveStep(2);
    } catch (error) {
      console.error('Error creating reservation:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error validation errors:', error.response?.data?.errors);

      // Show validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => console.error('Validation error:', err));
      }

      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear la reserva';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Upload payment proof after step 2
  const uploadPaymentProof = async () => {
    //console.log('uploadPaymentProof called');
    //console.log('reservationId:', reservationId);
    //console.log('paymentProof:', paymentProof);

    if (!paymentProof) {
      toast.error('Por favor sube el comprobante de pago');
      return;
    }

    if (!reservationId) {
      //console.error('No reservation ID found!');
      toast.error('Error: No se encontró el ID de la reserva. Por favor intenta crear la reserva nuevamente.');
      return;
    }

    setSubmitting(true);

    try {
      //console.log('Uploading payment proof for reservation:', reservationId);
      await reservationsAPI.uploadPaymentProof(reservationId, paymentProof);
      toast.success('Comprobante subido exitosamente');

      // Navigate to confirmation page
      navigate(`/reserva/${reservationId}/confirmacion`);
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al subir el comprobante';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando dispositivo..." />;
  }

  if (!device) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar el dispositivo</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dispositivos')}
          sx={{ mt: 2 }}
        >
          Volver a Dispositivos
        </Button>
      </Container>
    );
  }

  const selectedAccount = Array.isArray(bankAccounts)
    ? bankAccounts.find(acc => acc._id === selectedBankAccount)
    : null;

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Información del Dispositivo
            </Typography>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {modelo}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Precio Total:
                </Typography>
                <PriceDisplay
                  usdAmount={fullPrice}
                  usdVariant="h4"
                  arsVariant="body1"
                />
                {hasTradeIn && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Precio con canje aplicado: {tradeInDevice.modelo} ({Math.round(tradeInDevice.batteryHealth)}% batería)
                  </Alert>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Monto de Seña (20%):
                </Typography>
                <PriceDisplay
                  usdAmount={reservationAmount}
                  usdVariant="h5"
                  arsVariant="body2"
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ubicación:
                </Typography>
                <Typography variant="body1">
                  {device.ubicacion ||
                   (device.sucursal?.direccion?.calle ?
                     `${device.sucursal.direccion.calle} ${device.sucursal.direccion.altura || ''}, ${device.sucursal?.localidad || ''}, ${device.sucursal?.provincia || ''}`
                     : 'Ubicación no disponible')}
                </Typography>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Tu Información
            </Typography>
            {customerData ? (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    <strong>Usuario:</strong> {user.username}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Nombre:</strong> {customerData.nombre} {customerData.apellido}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {customerData.email}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Teléfono:</strong> {customerData.telefono}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="warning">
                No se pudo cargar tu información de cliente. Asegúrate de tener un perfil completo.
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              Al confirmar, tendrás 30 minutos para completar el pago y subir el comprobante.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            {timerStartTime && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HourglassIcon />
                  <Typography variant="body2" gutterBottom>
                    <strong>Tiempo restante:</strong> {timeLeft}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress || 0}
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      bgcolor: (progress || 0) > 50 ? 'success.main' : (progress || 0) > 25 ? 'warning.main' : 'error.main',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Si no subes el comprobante en ese tiempo, la reserva será cancelada automáticamente.
                </Typography>
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Monto a Pagar
            </Typography>
            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Seña (20% del total):
                </Typography>
                <PriceDisplay
                  usdAmount={reservationAmount}
                  usdVariant="h4"
                  arsVariant="h6"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Precio total del dispositivo: ${fullPrice.toFixed(2)} USD
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  El monto restante se abona al recibir el dispositivo
                </Typography>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Seleccioná Cuenta Bancaria
            </Typography>

            {bankAccounts.length === 0 ? (
              <Alert severity="error">
                No hay cuentas bancarias disponibles. Por favor contacta a soporte.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {bankAccounts.map((account) => (
                  <Grid size={{ xs: 12 }} key={account._id}>
                    <Card
                      variant={selectedBankAccount === account._id ? 'elevation' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        border: selectedBankAccount === account._id ? 2 : 1,
                        borderColor: selectedBankAccount === account._id ? 'primary.main' : 'divider',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => setSelectedBankAccount(account._id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {account.banco}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Tipo:</strong> {account.tipo === 'Corriente' ? 'Cuenta Corriente' : 'Caja de Ahorro'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>CBU:</strong> {account.cbu}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Alias:</strong> {account.alias}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Titular:</strong> {account.titular}
                            </Typography>
                            <Box sx={{ mt: 1.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                <strong>Monedas Aceptadas:</strong>
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {account.monedas && account.monedas.map((moneda) => (
                                  <Chip
                                    key={moneda}
                                    label={moneda}
                                    size="small"
                                    color={moneda === 'USD' ? 'success' : 'default'}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                          {selectedBankAccount === account._id && (
                            <Chip label="Seleccionada" color="primary" size="small" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            {timerStartTime && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HourglassIcon />
                  <Typography variant="body2">
                    <strong>Tiempo restante:</strong> {timeLeft}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress || 0}
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      bgcolor: (progress || 0) > 50 ? 'success.main' : (progress || 0) > 25 ? 'warning.main' : 'error.main',
                    },
                  }}
                />
              </Alert>
            )}

            {selectedAccount && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cuenta Seleccionada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Banco:</strong> {selectedAccount.banco}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CBU:</strong> {selectedAccount.cbu}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Alias:</strong> {selectedAccount.alias}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Monto a transferir:</strong>
                  </Typography>
                  <PriceDisplay usdAmount={reservationAmount} usdVariant="h6" arsVariant="body2" />
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Monedas Aceptadas:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedAccount.monedas && selectedAccount.monedas.map((moneda) => (
                        <Chip
                          key={moneda}
                          label={moneda}
                          size="small"
                          color={moneda === 'USD' ? 'success' : 'default'}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Typography variant="h6" gutterBottom>
              Subir Comprobante de Pago
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Por favor sube una foto o PDF del comprobante de transferencia
            </Alert>

            <Box
              sx={{
                border: 2,
                borderStyle: 'dashed',
                borderColor: paymentProof ? 'success.main' : 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                hidden
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {paymentProof ? paymentProof.name : 'Hacé clic para seleccionar archivo'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG, WEBP o PDF (máx. 5MB)
              </Typography>
            </Box>

            {paymentProofPreview && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Vista previa:
                </Typography>
                <img
                  src={paymentProofPreview}
                  alt="Vista previa"
                  style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/dispositivo/${deviceId}`)}
          sx={{ mb: 3 }}
        >
          Volver al Dispositivo
        </Button>

        <Typography variant="h4" gutterBottom>
          Reservar Dispositivo
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || submitting}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Atrás
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={uploadPaymentProof}
              disabled={submitting || !paymentProof}
            >
              {submitting ? <CircularProgress size={24} /> : 'Subir Comprobante'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Siguiente'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ReserveDevicePage;

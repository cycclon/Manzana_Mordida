import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { reservationsAPI } from '../../api/reservations';
import { productsAPI } from '../../api/products';
import { customersAPI } from '../../api/customers';
import { useCountdown } from '../../hooks/useCountdown';
import { LoadingScreen } from '../../components/common';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { StatusChip } from '../../components/common/StatusChip';

/**
 * ReservationConfirmationPage - Shows reservation details with countdown timer
 * Features: Reservation info, countdown to expiration, status display
 */
export const ReservationConfirmationPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [device, setDevice] = useState(null);
  const [customer, setCustomer] = useState(null);

  // Calculate expiration time (30 minutes from creation)
  const expirationTime = reservation?.createdAt
    ? new Date(reservation.createdAt).getTime() + 30 * 60 * 1000
    : null;

  const { timeLeft, isExpired, progress } = useCountdown(expirationTime);

  // Load reservation details
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await reservationsAPI.getReservationById(reservationId);
        // Handle both {data: ...} and direct object responses
        const data = response.data || response;
        console.log('Reservation data:', data);
        setReservation(data);

        // Fetch device details if equipo is an ObjectId string
        if (data.equipo && typeof data.equipo === 'string') {
          try {
            const deviceData = await productsAPI.getDeviceById(data.equipo);
            console.log('Device data:', deviceData);
            setDevice(deviceData);
          } catch (err) {
            console.error('Error fetching device:', err);
            // Continue without device details
          }
        } else if (data.equipo && typeof data.equipo === 'object') {
          // equipo is already populated
          setDevice(data.equipo);
        }

        // Fetch customer details using username
        if (data.usuarioCliente) {
          try {
            const customerData = await customersAPI.getCustomerByUsername(data.usuarioCliente);
            console.log('Customer data:', customerData);
            setCustomer(customerData);
          } catch (err) {
            console.error('Error fetching customer:', err);
            // Continue without customer details
          }
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
        toast.error('No se pudo cargar la reserva');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId, navigate]);

  // Handle expiration - only show if payment is pending
  useEffect(() => {
    if (isExpired && reservation?.sena?.estado === 'Solicitada') {
      toast.error('El tiempo para pagar la seña ha expirado');
      // Optionally refresh reservation status from backend
    }
  }, [isExpired, reservation]);

  if (loading) {
    return <LoadingScreen message="Cargando reserva..." />;
  }

  if (!reservation) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar la reserva</Alert>
        <Button
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  // Get device model from fetched device or fallback
  const modelo = device?.producto?.modelo ||
                 device?.modelo ||
                 device?.linea ||
                 reservation.equipo?.producto?.modelo ||
                 reservation.equipo?.modelo ||
                 'Dispositivo';

  const isPending = reservation.estado === 'Solicitada' || reservation.estado === 'Pendiente';
  const isPaymentPending = reservation.sena?.estado === 'Solicitada'; // Payment not yet made
  const isPaymentMade = reservation.sena?.estado === 'Pagada' || reservation.sena?.estado === 'Confirmada'; // Payment completed

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            ¡Reserva Creada Exitosamente!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tu solicitud de reserva ha sido recibida
          </Typography>
        </Box>

        {/* Status Alert */}
        {isPaymentMade && (
          <Alert severity="success" icon={<HourglassIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>¡Pago recibido!</strong> Tu comprobante ha sido enviado correctamente.
            </Typography>
            <Typography variant="body2">
              Nuestro equipo revisará tu comprobante de pago y te contactaremos pronto.
            </Typography>
          </Alert>
        )}

        {isPaymentPending && !isExpired && (
          <Alert severity="warning" icon={<HourglassIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Importante:</strong> Debes completar el pago de la seña.
            </Typography>
            <Typography variant="body2">
              Realiza la transferencia y sube el comprobante para confirmar tu reserva.
            </Typography>
          </Alert>
        )}

        {isExpired && isPaymentPending && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              El tiempo de reserva ha expirado. Por favor, contacta a soporte si ya realizaste el pago.
            </Typography>
          </Alert>
        )}

        {reservation.estado === 'Confirmada' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              ¡Tu reserva ha sido confirmada! Pronto nos pondremos en contacto contigo.
            </Typography>
          </Alert>
        )}

        {reservation.estado === 'Rechazada' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Tu reserva ha sido rechazada.
            </Typography>
            {reservation.motivoRechazo && (
              <Typography variant="body2">
                <strong>Motivo:</strong> {reservation.motivoRechazo}
              </Typography>
            )}
          </Alert>
        )}

        {/* Countdown Timer - Only show when payment is pending */}
        {isPaymentPending && !isExpired && (
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'warning.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Tiempo Restante para Pagar
                </Typography>
                <Chip
                  label={timeLeft}
                  color="warning"
                  icon={<HourglassIcon />}
                  sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress > 50 ? 'success.main' : progress > 25 ? 'warning.main' : 'error.main',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Si no se completa el pago en este tiempo, la reserva será cancelada automáticamente
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Reservation Details */}
        <Typography variant="h6" gutterBottom>
          Detalles de la Reserva
        </Typography>

        <Grid container spacing={3}>
          {/* Device Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Dispositivo
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {modelo}
                </Typography>
                {device?.color?.nombre && (
                  <Typography variant="body2" color="text.secondary">
                    Color: {device.color.nombre}
                  </Typography>
                )}
                {device?.condicionBateria && (
                  <Typography variant="body2" color="text.secondary">
                    Batería: {Math.round(device.condicionBateria * 100)}%
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Price */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Monto de Seña (20%)
                </Typography>
                <PriceDisplay
                  usdAmount={reservation.sena?.monto || 0}
                  usdVariant="h5"
                  arsVariant="body1"
                />
                {reservation.canje && (
                  <Chip
                    label="Con canje"
                    size="small"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Cliente
                </Typography>
                {customer ? (
                  <>
                    <Typography variant="body1">
                      {customer.nombres || customer.nombre} {customer.apellidos || customer.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer.email}
                    </Typography>
                    {(customer.whatsapp || customer.telefono) && (
                      <Typography variant="body2" color="text.secondary">
                        {customer.whatsapp || customer.telefono}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body1">
                    {reservation.usuarioCliente || 'Usuario'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estado
                </Typography>
                <StatusChip status={reservation.estado} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Estado de seña: {reservation.sena?.estado || 'Pendiente'}
                </Typography>
                {reservation.fecha && (
                  <Typography variant="body2" color="text.secondary">
                    Creada: {new Date(reservation.fecha).toLocaleString('es-AR')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Trade-in Info */}
          {reservation.canje && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Dispositivo de Canje
                  </Typography>
                  <Typography variant="body1">
                    {reservation.canje.modelo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Batería: {Math.round(reservation.canje.bateria * 100)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Payment Proof */}
          {reservation.sena?.comprobante && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Comprobante de Pago
                  </Typography>
                  <Button
                    startIcon={<ReceiptIcon />}
                    variant="outlined"
                    size="small"
                    href={reservation.sena.comprobante}
                    target="_blank"
                  >
                    Ver Comprobante
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Next Steps */}
        <Typography variant="h6" gutterBottom>
          Próximos Pasos
        </Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" paragraph>
            Nuestro equipo revisará tu comprobante de pago
          </Typography>
          <Typography component="li" variant="body2" paragraph>
            Te contactaremos por WhatsApp para confirmar la reserva
          </Typography>
          <Typography component="li" variant="body2" paragraph>
            Una vez confirmada, coordinaremos la entrega del dispositivo
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/perfil')}
          >
            Ver Mis Reservas
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReservationConfirmationPage;

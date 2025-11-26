import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  FormHelperText,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useUsernameAvailability } from '../../hooks/useUsernameAvailability';
import { registerSchema } from '../../utils/validators';
import { SUCCESS_MESSAGES } from '../../constants';
import { customersAPI } from '../../api/customers';

/**
 * RegisterForm Component
 * Creates User (msSeguridad) + Customer (msClientes)
 * Matches backend schema: username, password for User
 * nombres, apellidos, email, whatsapp for Customer
 */
export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      nombres: '',
      apellidos: '',
      email: '',
      whatsapp: '',
    },
  });

  // Watch username field for availability check
  const username = watch('username');

  // Check username availability (with 500ms debounce)
  const {
    isChecking,
    isAvailable,
    error: availabilityError,
  } = useUsernameAvailability(username, !isSubmitting);

  const onSubmit = async (data) => {
    // Prevent submission if username is not available
    if (isAvailable === false) {
      setError('El nombre de usuario no está disponible. Por favor, elige otro.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Register user in msSeguridad (role='viewer' automatic)
      const result = await registerUser({
        username: data.username,
        password: data.password,
      });

      if (result.success) {
        // Step 2: Create customer profile in msClientes
        // Wait a bit for token to be set in axios interceptor
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          await customersAPI.createCustomer({
            nombres: data.nombres,
            apellidos: data.apellidos,
            email: data.email,
            whatsapp: data.whatsapp || '',
            usuario: data.username, // Link to user via username
          });

          toast.success(SUCCESS_MESSAGES.REGISTER);
          navigate('/', { replace: true });
        } catch (customerErr) {
          // Show warning but still allow login
          toast.error('Usuario creado pero hubo un error al crear el perfil de cliente. Por favor contacta al soporte.');
          navigate('/', { replace: true });
        }
      } else {
        setError(result.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Username Field with Availability Check */}
      <TextField
        {...register('username')}
        margin="normal"
        required
        fullWidth
        id="username"
        label="Nombre de Usuario"
        name="username"
        autoComplete="username"
        autoFocus
        error={!!errors.username || (isAvailable === false && !isChecking)}
        disabled={isSubmitting}
        placeholder="usuario123"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {isChecking && <CircularProgress size={20} />}
              {!isChecking && isAvailable === true && (
                <CheckCircleIcon sx={{ color: 'success.main' }} />
              )}
              {!isChecking && isAvailable === false && (
                <CancelIcon sx={{ color: 'error.main' }} />
              )}
            </InputAdornment>
          ),
        }}
      />
      {/* Availability Status Helper Text */}
      <FormHelperText
        sx={{
          color: errors.username
            ? 'error.main'
            : isAvailable === true
            ? 'success.main'
            : isAvailable === false
            ? 'error.main'
            : 'text.secondary',
          mt: -1,
          mb: 1,
        }}
      >
        {errors.username?.message ||
          (isChecking && 'Verificando disponibilidad...') ||
          (isAvailable === true && '✓ Nombre de usuario disponible') ||
          (isAvailable === false && '✗ Nombre de usuario no disponible') ||
          (availabilityError && availabilityError) ||
          'Mínimo 4 caracteres. Solo letras, números, punto, guión'}
      </FormHelperText>

      {/* Name Fields (Grid) */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('nombres')}
            margin="normal"
            required
            fullWidth
            id="nombres"
            label="Nombre(s)"
            name="nombres"
            autoComplete="given-name"
            error={!!errors.nombres}
            helperText={errors.nombres?.message}
            disabled={isSubmitting}
            placeholder="Juan Carlos"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('apellidos')}
            margin="normal"
            required
            fullWidth
            id="apellidos"
            label="Apellido(s)"
            name="apellidos"
            autoComplete="family-name"
            error={!!errors.apellidos}
            helperText={errors.apellidos?.message}
            disabled={isSubmitting}
            placeholder="García López"
          />
        </Grid>
      </Grid>

      {/* Email Field */}
      <TextField
        {...register('email')}
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        autoComplete="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isSubmitting}
        placeholder="usuario@ejemplo.com"
      />

      {/* WhatsApp Field (Optional) */}
      <TextField
        {...register('whatsapp')}
        margin="normal"
        fullWidth
        id="whatsapp"
        label="WhatsApp (Opcional)"
        name="whatsapp"
        autoComplete="tel"
        error={!!errors.whatsapp}
        helperText={errors.whatsapp?.message}
        disabled={isSubmitting}
        placeholder="+54 11 1234-5678"
      />

      {/* Password Fields */}
      <TextField
        {...register('password')}
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        error={!!errors.password}
        helperText={errors.password?.message || 'Mínimo 8 caracteres, 1 mayúscula, 1 número'}
        disabled={isSubmitting}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                edge="end"
                disabled={isSubmitting}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...register('confirmPassword')}
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirmar Contraseña"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isSubmitting}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleToggleConfirmPassword}
                edge="end"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting || isChecking || isAvailable === false}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : <PersonAddIcon />}
      >
        {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link
          href="/login"
          variant="body2"
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          ¿Ya tienes cuenta? Inicia sesión aquí
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterForm;

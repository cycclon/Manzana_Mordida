import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validators';
import { SUCCESS_MESSAGES } from '../../constants';

/**
 * LoginForm Component - Uses username (not email) for login
 */
export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await login({
        username: data.username,
        password: data.password,
      });

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.LOGIN);

        // Redirect to the page they tried to visit or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        error={!!errors.username}
        helperText={errors.username?.message}
        disabled={isSubmitting}
        placeholder="usuario123"
      />

      <TextField
        {...register('password')}
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : <LoginIcon />}
      >
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link
          href="/registro"
          variant="body2"
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          ¿No tienes cuenta? Regístrate aquí
        </Link>
      </Box>
    </Box>
  );
};

export default LoginForm;

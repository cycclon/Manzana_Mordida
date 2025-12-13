import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  PointOfSale as SalesIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { usersAPI } from '../../api/users';
import { format } from 'date-fns';

const USER_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  VIEWER: 'viewer',
};

const ROLE_LABELS = {
  admin: 'Administrador',
  sales: 'Vendedor',
  viewer: 'Cliente',
};

const ROLE_COLORS = {
  admin: 'error',
  sales: 'primary',
  viewer: 'success',
};

/**
 * UsersManagementPage - Admin page for managing users
 */
const UsersManagementPage = () => {
  // State for users list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.SALES,
  });

  // State for form validation
  const [formErrors, setFormErrors] = useState({});

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar(error.response?.data?.message || 'Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Create handlers
  const handleOpenCreateDialog = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: USER_ROLES.SALES,
    });
    setFormErrors({});
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: USER_ROLES.SALES,
    });
    setFormErrors({});
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9._-]{4,}$/;
    if (!formData.username) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (!usernameRegex.test(formData.username)) {
      errors.username = 'Mínimo 4 caracteres: letras, números, punto, guión o guión bajo';
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Mínimo 8 caracteres, al menos 1 mayúscula y 1 número';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Role validation
    if (!formData.role || ![USER_ROLES.ADMIN, USER_ROLES.SALES].includes(formData.role)) {
      errors.role = 'Selecciona un rol válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCreate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Check if username exists
      const existsResponse = await usersAPI.checkUsernameExists(formData.username);
      if (existsResponse.exists) {
        setFormErrors({ username: 'Este nombre de usuario ya está en uso' });
        return;
      }

      // Create user
      await usersAPI.registerStaff({
        username: formData.username,
        password: formData.password,
        role: formData.role,
      });

      showSnackbar('Usuario creado exitosamente');
      handleCloseCreateDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showSnackbar(error.response?.data?.message || 'Error al crear usuario', 'error');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <AdminIcon fontSize="small" />;
      case USER_ROLES.SALES:
        return <SalesIcon fontSize="small" />;
      case USER_ROLES.VIEWER:
        return <ViewIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 }, mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          sx={{ flexShrink: 0 }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Solo puedes crear usuarios con roles de <strong>Administrador</strong> o <strong>Vendedor</strong>.
        Los clientes (Viewers) se registran desde la página pública.
      </Alert>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell>Última Actualización</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRoleIcon(user.role)}
                      {user.username}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[user.role] || user.role}
                      color={ROLE_COLORS[user.role] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {user.updatedAt ? format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  value={formData.username}
                  onChange={(e) => handleFormChange('username', e.target.value)}
                  error={!!formErrors.username}
                  helperText={formErrors.username || 'Mínimo 4 caracteres: letras, números, ., -, _'}
                  required
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  select
                  label="Rol"
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                  required
                >
                  <MenuItem value={USER_ROLES.SALES}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SalesIcon fontSize="small" />
                      Vendedor
                    </Box>
                  </MenuItem>
                  <MenuItem value={USER_ROLES.ADMIN}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AdminIcon fontSize="small" />
                      Administrador
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Mínimo 8 caracteres, 1 mayúscula, 1 número'}
                  required
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button onClick={handleSubmitCreate} variant="contained" color="primary">
            Crear Usuario
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
    </Box>
  );
};

export default UsersManagementPage;

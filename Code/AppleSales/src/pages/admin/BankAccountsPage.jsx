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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { bankAccountsAPI } from '../../api/bankAccounts';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CURRENCIES = ['Dólares', 'Pesos'];

/**
 * BankAccountsPage - Admin page for managing bank accounts
 */
const BankAccountsPage = () => {
  //console.log('BankAccountsPage loaded');
  // State for accounts list
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for dialogs
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // State for selected account
  const [selectedAccount, setSelectedAccount] = useState(null);

  // State for form data
  const [formData, setFormData] = useState({
    entidad: '',
    cbu: '',
    alias: '',
    titular: '',
    monedas: [],
  });

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankAccountsAPI.getAllBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showSnackbar(error.response?.data?.message || 'Error al cargar cuentas bancarias', 'error');
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

  // View handlers
  const handleView = (account) => {
    setSelectedAccount(account);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedAccount(null);
  };

  // Create handlers
  const handleOpenCreateDialog = () => {
    setFormData({
      entidad: '',
      cbu: '',
      alias: '',
      titular: '',
      monedas: [],
    });
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      entidad: '',
      cbu: '',
      alias: '',
      titular: '',
      monedas: [],
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitCreate = async () => {
    try {
      // Validate CBU length
      if (formData.cbu.length !== 22) {
        showSnackbar('El CBU debe tener exactamente 22 dígitos', 'error');
        return;
      }

      await bankAccountsAPI.createBankAccount(formData);
      showSnackbar('Cuenta bancaria creada exitosamente');
      handleCloseCreateDialog();
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      showSnackbar(error.response?.data?.message || 'Error al crear cuenta bancaria', 'error');
    }
  };

  // Edit handlers
  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      entidad: account.entidad,
      cbu: account.cbu,
      alias: account.alias,
      titular: account.titular,
      monedas: account.monedas,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedAccount(null);
    setFormData({
      entidad: '',
      cbu: '',
      alias: '',
      titular: '',
      monedas: [],
    });
  };

  const handleSubmitEdit = async () => {
    try {
      // Only send editable fields (alias and monedas)
      const updateData = {
        alias: formData.alias,
        monedas: formData.monedas,
      };

      await bankAccountsAPI.updateBankAccount(selectedAccount._id, updateData);
      showSnackbar('Cuenta bancaria actualizada exitosamente');
      handleCloseEditDialog();
      fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      showSnackbar(error.response?.data?.message || 'Error al actualizar cuenta bancaria', 'error');
    }
  };

  // Delete handlers
  const handleDelete = (account) => {
    setSelectedAccount(account);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAccount(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await bankAccountsAPI.deleteBankAccount(selectedAccount._id);
      showSnackbar('Cuenta bancaria eliminada exitosamente');
      handleCloseDeleteDialog();
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      showSnackbar(error.response?.data?.message || 'Error al eliminar cuenta bancaria', 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 }, mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          Gestión de Cuentas Bancarias
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          fullWidth
          sx={{ maxWidth: { xs: '100%', sm: 'auto' } }}
        >
          Nueva Cuenta
        </Button>
      </Box>

      {/* Accounts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Entidad</TableCell>
              <TableCell>CBU</TableCell>
              <TableCell>Alias</TableCell>
              <TableCell>Titular</TableCell>
              <TableCell>Monedas</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay cuentas bancarias registradas
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceIcon color="primary" fontSize="small" />
                      {account.entidad}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{account.cbu}</TableCell>
                  <TableCell>{account.alias}</TableCell>
                  <TableCell>{account.titular}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {account.monedas.map((moneda) => (
                        <Chip
                          key={moneda}
                          label={moneda}
                          size="small"
                          color={moneda === 'Dólares' ? 'success' : 'primary'}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(account)}
                      title="Ver detalles"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(account)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(account)}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Detalles de Cuenta Bancaria</DialogTitle>
        <DialogContent>
          {selectedAccount && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entidad Bancaria
                  </Typography>
                  <Typography variant="body1">{selectedAccount.entidad}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    CBU
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedAccount.cbu}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Alias
                  </Typography>
                  <Typography variant="body1">{selectedAccount.alias}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Titular
                  </Typography>
                  <Typography variant="body1">{selectedAccount.titular}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Monedas Aceptadas
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {selectedAccount.monedas.map((moneda) => (
                      <Chip
                        key={moneda}
                        label={moneda}
                        color={moneda === 'Dólares' ? 'success' : 'primary'}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Nueva Cuenta Bancaria</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Entidad Bancaria"
                  value={formData.entidad}
                  onChange={(e) => handleFormChange('entidad', e.target.value)}
                  required
                  helperText="Ej: Banco Nación, Banco Galicia, Mercado Pago"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="CBU"
                  value={formData.cbu}
                  onChange={(e) => handleFormChange('cbu', e.target.value)}
                  required
                  inputProps={{ maxLength: 22 }}
                  helperText={`${formData.cbu.length}/22 dígitos`}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Alias"
                  value={formData.alias}
                  onChange={(e) => handleFormChange('alias', e.target.value)}
                  required
                  helperText="Alias CVU de la cuenta"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Titular"
                  value={formData.titular}
                  onChange={(e) => handleFormChange('titular', e.target.value)}
                  required
                  helperText="Nombre del titular de la cuenta"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Monedas Aceptadas</InputLabel>
                  <Select
                    multiple
                    value={formData.monedas}
                    onChange={(e) => handleFormChange('monedas', e.target.value)}
                    input={<OutlinedInput label="Monedas Aceptadas" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {CURRENCIES.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button onClick={handleSubmitCreate} variant="contained" color="primary">
            Crear Cuenta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Editar Cuenta Bancaria</DialogTitle>
        <DialogContent>
          {selectedAccount && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Solo se puede editar el alias y las monedas aceptadas
              </Alert>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Entidad Bancaria"
                    value={formData.entidad}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="CBU"
                    value={formData.cbu}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Titular"
                    value={formData.titular}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Alias"
                    value={formData.alias}
                    onChange={(e) => handleFormChange('alias', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Monedas Aceptadas</InputLabel>
                    <Select
                      multiple
                      value={formData.monedas}
                      onChange={(e) => handleFormChange('monedas', e.target.value)}
                      input={<OutlinedInput label="Monedas Aceptadas" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {CURRENCIES.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSubmitEdit} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cuenta Bancaria"
        message={
          selectedAccount
            ? `¿Estás seguro que deseas eliminar la cuenta ${selectedAccount.alias} de ${selectedAccount.entidad}?`
            : ''
        }
        confirmText="Eliminar"
        severity="error"
      />

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

export default BankAccountsPage;

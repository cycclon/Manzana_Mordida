import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { branchesAPI } from '../../api/branches';

/**
 * BranchesPage - Admin interface for managing branches (sucursales)
 */
const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    provincia: '',
    localidad: '',
    barrio: '',
    calle: '',
    altura: '',
    piso: '',
    departamento: '',
    entreCalles: '',
    referencias: '',
    googleMaps: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesAPI.getAllBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      showSnackbar('Error al cargar sucursales', 'error');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenViewDialog = (branch) => {
    setSelectedBranch(branch);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedBranch(null);
  };

  const handleOpenEditDialog = (branch) => {
    setSelectedBranch(branch);
    setFormData({
      provincia: branch.provincia || '',
      localidad: branch.localidad || '',
      barrio: branch.barrio || '',
      calle: branch.direccion?.calle || '',
      altura: branch.direccion?.altura || '',
      piso: branch.direccion?.piso || '',
      departamento: branch.direccion?.departamento || '',
      entreCalles: branch.direccion?.entreCalles?.join(', ') || '',
      referencias: branch.direccion?.referencias?.join(', ') || '',
      googleMaps: branch.googleMaps || '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedBranch(null);
    resetFormData();
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      provincia: '',
      localidad: '',
      barrio: '',
      calle: '',
      altura: '',
      piso: '',
      departamento: '',
      entreCalles: '',
      referencias: '',
      googleMaps: '',
    });
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const prepareDataForSubmit = () => {
    return {
      provincia: formData.provincia,
      localidad: formData.localidad,
      barrio: formData.barrio,
      direccion: {
        calle: formData.calle,
        altura: formData.altura ? parseInt(formData.altura) : undefined,
        piso: formData.piso || undefined,
        departamento: formData.departamento || undefined,
        entreCalles: formData.entreCalles
          ? formData.entreCalles.split(',').map((s) => s.trim()).filter((s) => s)
          : undefined,
        referencias: formData.referencias
          ? formData.referencias.split(',').map((s) => s.trim()).filter((s) => s)
          : undefined,
      },
      googleMaps: formData.googleMaps || undefined,
    };
  };

  const handleSubmitCreate = async () => {
    try {
      const dataToSubmit = prepareDataForSubmit();
      await branchesAPI.createBranch(dataToSubmit);
      showSnackbar('Sucursal creada exitosamente');
      handleCloseCreateDialog();
      fetchBranches();
    } catch (error) {
      console.error('Error creating branch:', error);
      showSnackbar(error.response?.data?.message || 'Error al crear sucursal', 'error');
    }
  };

  const handleSubmitEdit = async () => {
    try {
      const dataToSubmit = prepareDataForSubmit();
      await branchesAPI.updateBranch(selectedBranch._id, dataToSubmit);
      showSnackbar('Sucursal actualizada exitosamente');
      handleCloseEditDialog();
      fetchBranches();
    } catch (error) {
      console.error('Error updating branch:', error);
      showSnackbar(error.response?.data?.message || 'Error al actualizar sucursal', 'error');
    }
  };

  const handleOpenDeleteDialog = (branch) => {
    setSelectedBranch(branch);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedBranch(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await branchesAPI.deleteBranch(selectedBranch._id);
      showSnackbar('Sucursal eliminada exitosamente');
      handleCloseDeleteDialog();
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      showSnackbar(error.response?.data?.message || 'Error al eliminar sucursal', 'error');
    }
  };

  const getFullAddress = (branch) => {
    const parts = [];
    if (branch.direccion?.calle) parts.push(branch.direccion.calle);
    if (branch.direccion?.altura) parts.push(branch.direccion.altura);
    if (branch.direccion?.piso) parts.push(`Piso ${branch.direccion.piso}`);
    if (branch.direccion?.departamento) parts.push(`Depto ${branch.direccion.departamento}`);
    return parts.join(' ') || 'N/A';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Sucursales</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Agregar Sucursal
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBranches}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provincia</TableCell>
              <TableCell>Localidad</TableCell>
              <TableCell>Barrio</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No hay sucursales registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              branches
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((branch) => (
                  <TableRow key={branch._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {branch.provincia || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {branch.localidad || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {branch.barrio || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getFullAddress(branch)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenViewDialog(branch)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(branch)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(branch)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {branch.googleMaps && (
                        <Tooltip title="Ver en Google Maps">
                          <IconButton
                            size="small"
                            color="success"
                            component="a"
                            href={branch.googleMaps}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LocationIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={branches.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
        />
      </TableContainer>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Detalles de la Sucursal</DialogTitle>
        <DialogContent>
          {selectedBranch && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{xs:12, sm:6}}>
                <Typography variant="subtitle2" color="text.secondary">Provincia</Typography>
                <Typography variant="body1">{selectedBranch.provincia || 'N/A'}</Typography>
              </Grid>

              <Grid size={{xs:12, sm:6}}>
                <Typography variant="subtitle2" color="text.secondary">Localidad</Typography>
                <Typography variant="body1">{selectedBranch.localidad || 'N/A'}</Typography>
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary">Barrio</Typography>
                <Typography variant="body1">{selectedBranch.barrio || 'N/A'}</Typography>
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Dirección
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    <strong>Calle:</strong> {selectedBranch.direccion?.calle || 'N/A'}
                  </Typography>
                  {selectedBranch.direccion?.altura && (
                    <Typography variant="body2">
                      <strong>Altura:</strong> {selectedBranch.direccion.altura}
                    </Typography>
                  )}
                  {selectedBranch.direccion?.piso && (
                    <Typography variant="body2">
                      <strong>Piso:</strong> {selectedBranch.direccion.piso}
                    </Typography>
                  )}
                  {selectedBranch.direccion?.departamento && (
                    <Typography variant="body2">
                      <strong>Departamento:</strong> {selectedBranch.direccion.departamento}
                    </Typography>
                  )}
                  {selectedBranch.direccion?.entreCalles?.length > 0 && (
                    <Typography variant="body2">
                      <strong>Entre calles:</strong> {selectedBranch.direccion.entreCalles.join(', ')}
                    </Typography>
                  )}
                  {selectedBranch.direccion?.referencias?.length > 0 && (
                    <Typography variant="body2">
                      <strong>Referencias:</strong> {selectedBranch.direccion.referencias.join(', ')}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {selectedBranch.googleMaps && (
                <Grid size={{xs:12}}>
                  <Typography variant="subtitle2" color="text.secondary">Google Maps</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocationIcon />}
                    href={selectedBranch.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    Ver en Google Maps
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Editar Sucursal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Provincia"
                value={formData.provincia}
                onChange={(e) => handleFormChange('provincia', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Localidad"
                value={formData.localidad}
                onChange={(e) => handleFormChange('localidad', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Barrio"
                value={formData.barrio}
                onChange={(e) => handleFormChange('barrio', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:8}}>
              <TextField
                fullWidth
                label="Calle"
                value={formData.calle}
                onChange={(e) => handleFormChange('calle', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:4}}>
              <TextField
                fullWidth
                type="number"
                label="Altura"
                value={formData.altura}
                onChange={(e) => handleFormChange('altura', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Piso"
                value={formData.piso}
                onChange={(e) => handleFormChange('piso', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Departamento"
                value={formData.departamento}
                onChange={(e) => handleFormChange('departamento', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Entre calles"
                value={formData.entreCalles}
                onChange={(e) => handleFormChange('entreCalles', e.target.value)}
                helperText="Separar con comas (ej: Av. Libertador, San Martín)"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Referencias"
                value={formData.referencias}
                onChange={(e) => handleFormChange('referencias', e.target.value)}
                helperText="Separar con comas (ej: Frente a la plaza, Edificio azul)"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Google Maps URL"
                value={formData.googleMaps}
                onChange={(e) => handleFormChange('googleMaps', e.target.value)}
                helperText="Link o embed de Google Maps"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSubmitEdit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Agregar Sucursal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Provincia"
                value={formData.provincia}
                onChange={(e) => handleFormChange('provincia', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Localidad"
                value={formData.localidad}
                onChange={(e) => handleFormChange('localidad', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Barrio"
                value={formData.barrio}
                onChange={(e) => handleFormChange('barrio', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:8}}>
              <TextField
                fullWidth
                label="Calle"
                value={formData.calle}
                onChange={(e) => handleFormChange('calle', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:4}}>
              <TextField
                fullWidth
                type="number"
                label="Altura"
                value={formData.altura}
                onChange={(e) => handleFormChange('altura', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Piso"
                value={formData.piso}
                onChange={(e) => handleFormChange('piso', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Departamento"
                value={formData.departamento}
                onChange={(e) => handleFormChange('departamento', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Entre calles"
                value={formData.entreCalles}
                onChange={(e) => handleFormChange('entreCalles', e.target.value)}
                helperText="Separar con comas (ej: Av. Libertador, San Martín)"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Referencias"
                value={formData.referencias}
                onChange={(e) => handleFormChange('referencias', e.target.value)}
                helperText="Separar con comas (ej: Frente a la plaza, Edificio azul)"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Google Maps URL"
                value={formData.googleMaps}
                onChange={(e) => handleFormChange('googleMaps', e.target.value)}
                helperText="Link o embed de Google Maps"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button onClick={handleSubmitCreate} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        disableRestoreFocus
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar esta sucursal? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BranchesPage;

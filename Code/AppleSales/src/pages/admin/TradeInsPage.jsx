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
  Chip,
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
  FormControlLabel,
  Checkbox,
  FormGroup,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { tradeInsAPI } from '../../api/tradeIns';
import { PriceDisplay } from '../../components/common/PriceDisplay';

// Product lines available for trade-ins
const PRODUCT_LINES = ['iPhone', 'iPad', 'Macbook', 'AirPods', 'Apple Watch'];

/**
 * TradeInsPage - Admin interface for managing trade-in pricing configuration
 */
const TradeInsPage = () => {
  const [tradeIns, setTradeIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTradeIn, setSelectedTradeIn] = useState(null);
  const [modelFilters, setModelFilters] = useState([]);
  const [selectedTradeIns, setSelectedTradeIns] = useState([]);
  const [openBulkUpdateDialog, setOpenBulkUpdateDialog] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    updateType: 'fixed', // 'fixed' or 'percentage'
    value: '',
  });
  const [editFormData, setEditFormData] = useState({
    linea: '',
    modelo: '',
    bateriaMin: '',
    bateriaMax: '',
    precioCanje: '',
  });
  const [createFormData, setCreateFormData] = useState({
    linea: '',
    modelo: '',
    bateriaMin: '',
    bateriaMax: '',
    precioCanje: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch trade-ins
  const fetchTradeIns = async () => {
    setLoading(true);
    try {
      const data = await tradeInsAPI.getAllTradeIns();
      setTradeIns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trade-ins:', error);
      showSnackbar('Error al cargar canjes', 'error');
      setTradeIns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeIns();
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

  const handleOpenViewDialog = (tradeIn) => {
    setSelectedTradeIn(tradeIn);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedTradeIn(null);
  };

  const handleOpenEditDialog = (tradeIn) => {
    setSelectedTradeIn(tradeIn);
    setEditFormData({
      linea: tradeIn.linea || '',
      modelo: tradeIn.modelo || '',
      bateriaMin: tradeIn.bateriaMin ? (tradeIn.bateriaMin * 100) : '',
      bateriaMax: tradeIn.bateriaMax ? (tradeIn.bateriaMax * 100) : '',
      precioCanje: tradeIn.precioCanje || '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedTradeIn(null);
    setEditFormData({
      linea: '',
      modelo: '',
      bateriaMin: '',
      bateriaMax: '',
      precioCanje: '',
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  const handleSubmitEdit = async () => {
    try {
      // Convert percentages back to decimals for database
      const dataToSubmit = {
        ...editFormData,
        bateriaMin: editFormData.bateriaMin ? parseFloat(editFormData.bateriaMin) / 100 : undefined,
        bateriaMax: editFormData.bateriaMax ? parseFloat(editFormData.bateriaMax) / 100 : undefined,
      };
      await tradeInsAPI.updateTradeIn(selectedTradeIn._id, dataToSubmit);
      showSnackbar('Precio de canje actualizado exitosamente');
      handleCloseEditDialog();
      fetchTradeIns();
    } catch (error) {
      console.error('Error updating trade-in price:', error);
      showSnackbar(error.response?.data?.message || 'Error al actualizar precio de canje', 'error');
    }
  };

  const handleOpenDeleteDialog = (tradeIn) => {
    setSelectedTradeIn(tradeIn);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTradeIn(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await tradeInsAPI.deleteTradeIn(selectedTradeIn._id);
      showSnackbar('Canje eliminado exitosamente');
      handleCloseDeleteDialog();
      fetchTradeIns();
    } catch (error) {
      console.error('Error deleting trade-in:', error);
      showSnackbar(error.response?.data?.message || 'Error al eliminar canje', 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setCreateFormData({
      linea: '',
      modelo: '',
      bateriaMin: '',
      bateriaMax: '',
      precioCanje: '',
    });
  };

  const handleCreateFormChange = (field, value) => {
    setCreateFormData({ ...createFormData, [field]: value });
  };

  const handleSubmitCreate = async () => {
    try {
      // Convert percentages back to decimals for database
      const dataToSubmit = {
        ...createFormData,
        bateriaMin: createFormData.bateriaMin ? parseFloat(createFormData.bateriaMin) / 100 : undefined,
        bateriaMax: createFormData.bateriaMax ? parseFloat(createFormData.bateriaMax) / 100 : undefined,
      };
      await tradeInsAPI.createTradeIn(dataToSubmit);
      showSnackbar('Precio de canje creado exitosamente');
      handleCloseCreateDialog();
      fetchTradeIns();
    } catch (error) {
      console.error('Error creating trade-in price:', error);
      showSnackbar(error.response?.data?.message || 'Error al crear precio de canje', 'error');
    }
  };

  const handleModelFilterChange = (model) => {
    setModelFilters((prev) => {
      if (prev.includes(model)) {
        return prev.filter((m) => m !== model);
      } else {
        return [...prev, model];
      }
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setModelFilters([]);
    setPage(0);
  };

  // Bulk selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredAndSortedTradeIns.map((t) => t._id);
      setSelectedTradeIns(allIds);
    } else {
      setSelectedTradeIns([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedTradeIns((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleOpenBulkUpdateDialog = () => {
    setOpenBulkUpdateDialog(true);
  };

  const handleCloseBulkUpdateDialog = () => {
    setOpenBulkUpdateDialog(false);
    setBulkUpdateData({
      updateType: 'fixed',
      value: '',
    });
  };

  const handleBulkUpdateChange = (field, value) => {
    setBulkUpdateData({ ...bulkUpdateData, [field]: value });
  };

  const handleSubmitBulkUpdate = async () => {
    try {
      const { updateType, value } = bulkUpdateData;
      const numValue = parseFloat(value);

      if (!numValue || numValue === 0) {
        showSnackbar('Por favor ingresa un valor válido', 'error');
        return;
      }

      // Update each selected trade-in
      const updatePromises = selectedTradeIns.map(async (id) => {
        const tradeIn = tradeIns.find((t) => t._id === id);
        if (!tradeIn) return;

        let newPrice;
        if (updateType === 'fixed') {
          // Fixed amount increase/decrease
          newPrice = tradeIn.precioCanje + numValue;
        } else {
          // Percentage increase/decrease
          newPrice = tradeIn.precioCanje * (1 + numValue / 100);
        }

        // Ensure price doesn't go below 0
        newPrice = Math.max(0, newPrice);

        return tradeInsAPI.updateTradeIn(id, {
          precioCanje: newPrice,
        });
      });

      await Promise.all(updatePromises);

      showSnackbar(`${selectedTradeIns.length} precios actualizados exitosamente`);
      handleCloseBulkUpdateDialog();
      setSelectedTradeIns([]);
      fetchTradeIns();
    } catch (error) {
      console.error('Error updating prices:', error);
      showSnackbar(error.response?.data?.message || 'Error al actualizar precios', 'error');
    }
  };

  // Get unique models for filter
  const uniqueModels = [...new Set(tradeIns.map((t) => t.modelo))].sort();

  // Filter and sort trade-ins
  const filteredAndSortedTradeIns = tradeIns
    .filter((tradeIn) => modelFilters.length === 0 || modelFilters.includes(tradeIn.modelo))
    .sort((a, b) => {
      // First sort by modelo
      const modelCompare = a.modelo.localeCompare(b.modelo);
      if (modelCompare !== 0) return modelCompare;

      // Then sort by bateriaMin (ascending - lowest battery first)
      return (a.bateriaMin || 0) - (b.bateriaMin || 0);
    });

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Aprobado':
        return 'info';
      case 'Completado':
        return 'success';
      case 'Rechazado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Precios de Canje</Typography>
        <Box display="flex" gap={2}>
          {selectedTradeIns.length > 0 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenBulkUpdateDialog}
            >
              Actualizar Precios ({selectedTradeIns.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Agregar Precio
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTradeIns}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Model Filter */}
      {uniqueModels.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={500}>
              Filtrar por Modelo
            </Typography>
            {modelFilters.length > 0 && (
              <Button size="small" onClick={handleClearFilters}>
                Limpiar filtros ({modelFilters.length})
              </Button>
            )}
          </Box>
          <FormGroup row>
            {uniqueModels.map((model) => (
              <FormControlLabel
                key={model}
                control={
                  <Checkbox
                    checked={modelFilters.includes(model)}
                    onChange={() => handleModelFilterChange(model)}
                    size="small"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2">{model}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({tradeIns.filter((t) => t.modelo === model).length})
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Paper>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    filteredAndSortedTradeIns.length > 0 &&
                    selectedTradeIns.length === filteredAndSortedTradeIns.length
                  }
                  indeterminate={
                    selectedTradeIns.length > 0 &&
                    selectedTradeIns.length < filteredAndSortedTradeIns.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Línea</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Batería Mínima</TableCell>
              <TableCell>Batería Máxima</TableCell>
              <TableCell>Precio de Canje</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredAndSortedTradeIns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {modelFilters.length > 0
                      ? 'No hay precios de canje que coincidan con los filtros seleccionados'
                      : 'No hay precios de canje registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTradeIns
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tradeIn) => (
                  <TableRow
                    key={tradeIn._id}
                    hover
                    selected={selectedTradeIns.includes(tradeIn._id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTradeIns.includes(tradeIn._id)}
                        onChange={() => handleSelectOne(tradeIn._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {tradeIn.linea || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tradeIn.modelo || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tradeIn.bateriaMin ? `${(tradeIn.bateriaMin * 100).toFixed(0)}%` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tradeIn.bateriaMax ? `${(tradeIn.bateriaMax * 100).toFixed(0)}%` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PriceDisplay
                        usdAmount={tradeIn.precioCanje}
                        usdVariant="body2"
                        arsVariant="caption"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenViewDialog(tradeIn)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(tradeIn)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(tradeIn)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredAndSortedTradeIns.length}
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
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Detalles del Precio de Canje</DialogTitle>
        <DialogContent>
          {selectedTradeIn && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary">Línea</Typography>
                <Typography variant="body1">
                  {selectedTradeIn.linea || 'N/A'}
                </Typography>
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary">Modelo</Typography>
                <Typography variant="body1">
                  {selectedTradeIn.modelo || 'N/A'}
                </Typography>
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary">Batería Mínima</Typography>
                <Typography variant="body1">
                  {selectedTradeIn.bateriaMin ? `${(selectedTradeIn.bateriaMin * 100).toFixed(0)}%` : 'N/A'}
                </Typography>
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary">Batería Máxima</Typography>
                <Typography variant="body1">
                  {selectedTradeIn.bateriaMax ? `${(selectedTradeIn.bateriaMax * 100).toFixed(0)}%` : 'N/A'}
                </Typography>
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle2" color="text.secondary">Precio de Canje</Typography>
                <PriceDisplay
                  usdAmount={selectedTradeIn.precioCanje}
                  usdVariant="body1"
                  arsVariant="body2"
                />
              </Grid>
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
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Editar Precio de Canje</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                select
                label="Línea"
                value={editFormData.linea}
                onChange={(e) => handleEditFormChange('linea', e.target.value)}
                required
              >
                {PRODUCT_LINES.map((line) => (
                  <MenuItem key={line} value={line}>
                    {line}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{xs:12}}>
              <Autocomplete
                fullWidth
                freeSolo
                options={uniqueModels}
                value={editFormData.modelo}
                onChange={(event, newValue) => {
                  handleEditFormChange('modelo', newValue || '');
                }}
                onInputChange={(event, newInputValue) => {
                  handleEditFormChange('modelo', newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Modelo"
                    required
                    helperText="Selecciona un modelo existente o escribe uno nuevo"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                type="number"
                label="Batería Mínima (%)"
                value={editFormData.bateriaMin}
                onChange={(e) => handleEditFormChange('bateriaMin', e.target.value)}
                inputProps={{ min: 0, max: 100, step: 1 }}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                type="number"
                label="Batería Máxima (%)"
                value={editFormData.bateriaMax}
                onChange={(e) => handleEditFormChange('bateriaMax', e.target.value)}
                inputProps={{ min: 0, max: 100, step: 1 }}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                type="number"
                label="Precio de Canje (USD)"
                value={editFormData.precioCanje}
                onChange={(e) => handleEditFormChange('precioCanje', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        disableRestoreFocus
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar este canje? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog
        open={openBulkUpdateDialog}
        onClose={handleCloseBulkUpdateDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Actualizar Precios en Lote</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedTradeIns.length} precio(s) seleccionado(s)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                select
                label="Tipo de Actualización"
                value={bulkUpdateData.updateType}
                onChange={(e) => handleBulkUpdateChange('updateType', e.target.value)}
              >
                <MenuItem value="fixed">Monto Fijo (USD)</MenuItem>
                <MenuItem value="percentage">Porcentaje (%)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                type="number"
                label={
                  bulkUpdateData.updateType === 'fixed'
                    ? 'Monto a Aumentar/Disminuir (USD)'
                    : 'Porcentaje a Aumentar/Disminuir (%)'
                }
                value={bulkUpdateData.value}
                onChange={(e) => handleBulkUpdateChange('value', e.target.value)}
                helperText={
                  bulkUpdateData.updateType === 'fixed'
                    ? 'Usa números positivos para aumentar, negativos para disminuir (ej: 10 o -10)'
                    : 'Usa números positivos para aumentar, negativos para disminuir (ej: 10 o -10)'
                }
                inputProps={{ step: bulkUpdateData.updateType === 'fixed' ? 0.01 : 1 }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkUpdateDialog}>Cancelar</Button>
          <Button onClick={handleSubmitBulkUpdate} variant="contained" color="primary">
            Actualizar Precios
          </Button>
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
        <DialogTitle>Agregar Precio de Canje</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                select
                label="Línea"
                value={createFormData.linea}
                onChange={(e) => handleCreateFormChange('linea', e.target.value)}
                required
              >
                {PRODUCT_LINES.map((line) => (
                  <MenuItem key={line} value={line}>
                    {line}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{xs:12}}>
              <Autocomplete
                fullWidth
                freeSolo
                options={uniqueModels}
                value={createFormData.modelo}
                onChange={(event, newValue) => {
                  handleCreateFormChange('modelo', newValue || '');
                }}
                onInputChange={(event, newInputValue) => {
                  handleCreateFormChange('modelo', newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Modelo"
                    required
                    helperText="Selecciona un modelo existente o escribe uno nuevo"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                type="number"
                label="Batería Mínima (%)"
                value={createFormData.bateriaMin}
                onChange={(e) => handleCreateFormChange('bateriaMin', e.target.value)}
                inputProps={{ min: 0, max: 100, step: 1 }}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                type="number"
                label="Batería Máxima (%)"
                value={createFormData.bateriaMax}
                onChange={(e) => handleCreateFormChange('bateriaMax', e.target.value)}
                inputProps={{ min: 0, max: 100, step: 1 }}
                required
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                type="number"
                label="Precio de Canje (USD)"
                value={createFormData.precioCanje}
                onChange={(e) => handleCreateFormChange('precioCanje', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                required
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

export default TradeInsPage;

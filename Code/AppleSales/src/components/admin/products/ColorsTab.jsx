import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
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
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Chip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../../api/products';

/**
 * ColorsTab - CRUD interface for managing colors
 */
export const ColorsTab = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit' | 'delete'
  const [selectedColor, setSelectedColor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    hex: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch colors
  const fetchColors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAllColors();
      setColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
      showSnackbar('Error al cargar colores', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setSelectedColor(null);
    setFormData({ nombre: '', hex: '' });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (color) => {
    setDialogMode('edit');
    setSelectedColor(color);
    setFormData({
      nombre: color.nombre,
      hex: color.hex,
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (color) => {
    setDialogMode('delete');
    setSelectedColor(color);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedColor(null);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await productsAPI.createColor(formData);
        showSnackbar('Color creado exitosamente');
      } else if (dialogMode === 'edit') {
        await productsAPI.updateColor(selectedColor._id, formData);
        showSnackbar('Color actualizado exitosamente');
      }
      handleCloseDialog();
      fetchColors();
    } catch (error) {
      console.error('Error saving color:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al guardar color',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    try {
      await productsAPI.deleteColor(selectedColor._id);
      showSnackbar('Color eliminado exitosamente');
      handleCloseDialog();
      fetchColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al eliminar color',
        'error'
      );
    }
  };

  return (
    <Box>
      {/* Actions Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Colores Disponibles</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchColors}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nuevo Color
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código Hex</TableCell>
              <TableCell width={100}>Vista Previa</TableCell>
              <TableCell width={120} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : colors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No hay colores registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              colors.map((color) => (
                <TableRow key={color._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {color.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={color.hex} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        backgroundColor: color.hex,
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(color)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(color)}
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
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog && (dialogMode === 'create' || dialogMode === 'edit')}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Nuevo Color' : 'Editar Color'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Color"
              value={formData.nombre}
              onChange={(e) => handleFormChange('nombre', e.target.value)}
              placeholder="Ej: Negro espacial"
            />
            <TextField
              fullWidth
              label="Código Hexadecimal"
              value={formData.hex}
              onChange={(e) => handleFormChange('hex', e.target.value)}
              placeholder="#000000"
              InputProps={{
                startAdornment: formData.hex && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: formData.hex,
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: 1,
                      mr: 1,
                    }}
                  />
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog && dialogMode === 'delete'} onClose={handleCloseDialog} disableRestoreFocus>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este color?
          </Typography>
          {selectedColor && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: selectedColor.hex,
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 1,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedColor.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedColor.hex}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            No se puede eliminar un color que esté siendo utilizado por productos o dispositivos.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

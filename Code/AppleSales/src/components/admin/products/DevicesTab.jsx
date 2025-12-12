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
  TablePagination,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
  FormGroup,
  InputAdornment,
  Autocomplete,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { productsAPI } from '../../../api/products';
import { branchesAPI } from '../../../api/branches';
import { PriceDisplay } from '../../common/PriceDisplay';
import { getThumbnailUrl } from '../../../utils/imageOptimization';

const DEVICE_CONDITIONS = ['Sellado', 'Usado', 'ASIS', 'OEM', 'CPO'];
const DEVICE_GRADES = ['A+', 'A', 'A-'];
const DEVICE_STATES = ['En Stock', 'Pedido', 'Reservado', 'Vendido', 'Baja', 'A pedido'];
const ACCESSOIRES = ['Caja', 'Cable', 'Templado', 'Funda', 'Cargador'];
const WARRANTY_OWN = ['30 días', '60 días', '90 días'];

/**
 * DevicesTab - CRUD interface for managing device instances (stock)
 */
export const DevicesTab = () => {
  const [devices, setDevices] = useState([]);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [availableDetalles, setAvailableDetalles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const [lineaFilters, setLineaFilters] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState('');
  const [formData, setFormData] = useState({
    producto: '',
    color: '',
    condicion: '',
    grado: '',
    estado: 'En Stock',
    condicionBateria: '', // Stored as percentage (0-100) in form, converted to decimal (0-1) for DB
    costo: '',
    precio: '',
    detalles: [],
    accesorios: [],
    garantiaApple: '',
    garantiaPropia: '',
    ubicacion: '',
    canjeable: false,
    fechaVenta: '', // Date when device was sold (YYYY-MM-DD)
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Image upload state
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAllDevices();
      // The API returns a simple array, not paginated
      const devicesArray = Array.isArray(response) ? response : [];
      setDevices(devicesArray);
      setTotalCount(devicesArray.length);
    } catch (error) {
      console.error('Error fetching devices:', error);
      showSnackbar('Error al cargar dispositivos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  const fetchColors = useCallback(async () => {
    try {
      const data = await productsAPI.getAllColors();
      setColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  }, []);

  const fetchDetalles = useCallback(async () => {
    try {
      const data = await productsAPI.getAllDetalles();
      //console.log('Detalles fetched:', data, 'Type:', typeof data, 'Is array:', Array.isArray(data));
      if (Array.isArray(data)) {
        setAvailableDetalles(data);
      } else {
        console.error('Detalles is not an array:', data);
        setAvailableDetalles([]);
      }
    } catch (error) {
      console.error('Error fetching detalles:', error);
      setAvailableDetalles([]);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const data = await branchesAPI.getAllBranches();
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchProducts();
    fetchColors();
    fetchDetalles();
    fetchBranches();
  }, [fetchDevices, fetchProducts, fetchColors, fetchDetalles, fetchBranches]);

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

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setSelectedDevice(null);
    setSelectedProductType('');
    setFormData({
      producto: '',
      color: '',
      condicion: '',
      grado: '',
      estado: 'En Stock',
      condicionBateria: '',
      costo: '',
      precio: '',
      detalles: [],
      accesorios: [],
      garantiaApple: '',
      garantiaPropia: '',
      ubicacion: '',
      canjeable: false,
      fechaVenta: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (device) => {
    setDialogMode('edit');
    setSelectedDevice(device);

    // Find the product's linea to set the product type
    const deviceProduct = products.find(p => p.modelo === (device.producto?.modelo || device.producto));
    if (deviceProduct) {
      setSelectedProductType(deviceProduct.linea);
    }

    setFormData({
      producto: device.producto?.modelo || device.producto || '',
      color: device.color?.nombre || device.color || '',
      condicion: device.condicion || '',
      grado: device.grado || '',
      estado: device.estado || 'En Stock',
      condicionBateria: device.condicionBateria ? (device.condicionBateria * 100) : '', // Convert decimal to percentage
      costo: device.costo || '',
      precio: device.precio || '',
      detalles: device.detalles || [],
      accesorios: device.accesorios || [],
      garantiaApple: device.garantiaApple ? device.garantiaApple.split('T')[0] : '',
      garantiaPropia: device.garantiaPropia || '',
      ubicacion: device.ubicacion || '',
      canjeable: device.canjeable || false,
      fechaVenta: device.fechaVenta ? device.fechaVenta.split('T')[0] : '',
    });
    // Load existing images
    setExistingImages(device.imagenes || []);
    setSelectedImages([]);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (device) => {
    setDialogMode('delete');
    setSelectedDevice(device);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDevice(null);
    setSelectedImages([]);
    setExistingImages([]);
  };

  const handleFormChange = (field, value) => {
    // If product changes, clear color selection (since available colors will change)
    if (field === 'producto') {
      setFormData({ ...formData, [field]: value, color: '' });
    } else if (field === 'condicion' && value === 'Sellado') {
      // If condition is Sellado (Sealed), clear grado and warranties since sealed devices don't need them
      setFormData({
        ...formData,
        [field]: value,
        grado: '',
        garantiaApple: '',
        garantiaPropia: ''
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    const totalImages = existingImages.length + selectedImages.length + files.length;

    if (totalImages > 5) {
      showSnackbar(`Máximo 5 imágenes permitidas. Actualmente: ${existingImages.length + selectedImages.length}`, 'error');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleRemoveSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageUrl) => {
    if (!selectedDevice) return;

    if (!window.confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await productsAPI.deleteDeviceImage(selectedDevice._id, imageUrl);
      setExistingImages(prev => prev.filter(img => img !== imageUrl));
      showSnackbar('Imagen eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showSnackbar('Error al eliminar imagen', 'error');
    }
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0 || !selectedDevice) return;

    try {
      setUploadingImages(true);
      await productsAPI.uploadDeviceImages(selectedDevice._id, selectedImages);
      showSnackbar('Imágenes subidas exitosamente', 'success');

      // Refresh device to get updated images
      const updatedDevice = await productsAPI.getDeviceById(selectedDevice._id);
      setExistingImages(updatedDevice.imagenes || []);
      setSelectedImages([]);

      // Refresh devices list
      fetchDevices();
    } catch (error) {
      console.error('Error uploading images:', error);
      showSnackbar(error.response?.data?.message || 'Error al subir imágenes', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const deviceData = {
        ...formData,
        precio: parseFloat(formData.precio),
        costo: parseFloat(formData.costo),
        condicionBateria: formData.condicionBateria ? parseFloat(formData.condicionBateria) / 100 : undefined, // Convert percentage to decimal
        grado: formData.grado || undefined, // Omit grado if empty (for Sealed devices)
        garantiaApple: formData.garantiaApple || undefined,
        garantiaPropia: formData.garantiaPropia || undefined,
        fechaVenta: formData.fechaVenta || undefined, // Only send if provided
      };

      if (dialogMode === 'create') {
        await productsAPI.createDevice(deviceData);
        showSnackbar('Dispositivo creado exitosamente');
      } else if (dialogMode === 'edit') {
        await productsAPI.updateDevice(selectedDevice._id, deviceData);
        showSnackbar('Dispositivo actualizado exitosamente');
      }

      handleCloseDialog();
      fetchDevices();
    } catch (error) {
      console.error('Error saving device:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al guardar dispositivo',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    try {
      await productsAPI.deleteDevice(selectedDevice._id);
      showSnackbar('Dispositivo eliminado exitosamente');
      handleCloseDialog();
      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al eliminar dispositivo',
        'error'
      );
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allDeviceIds = devices.map((device) => device._id);
      setSelectedDevices(allDeviceIds);
    } else {
      setSelectedDevices([]);
    }
  };

  const handleSelectDevice = (deviceId) => {
    setSelectedDevices((prev) => {
      if (prev.includes(deviceId)) {
        return prev.filter((id) => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const handleOpenBulkStatusDialog = () => {
    setBulkStatus('');
    setBulkStatusDialogOpen(true);
  };

  const handleCloseBulkStatusDialog = () => {
    setBulkStatusDialogOpen(false);
    setBulkStatus('');
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      showSnackbar('Seleccione un estado', 'warning');
      return;
    }

    try {
      // Update all selected devices
      await Promise.all(
        selectedDevices.map((deviceId) =>
          productsAPI.updateDevice(deviceId, { estado: bulkStatus })
        )
      );

      showSnackbar(`${selectedDevices.length} dispositivos actualizados exitosamente`);
      setSelectedDevices([]);
      handleCloseBulkStatusDialog();
      fetchDevices();
    } catch (error) {
      console.error('Error updating devices:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al actualizar dispositivos',
        'error'
      );
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
    setPage(0); // Reset to first page when filter changes
  };

  const handleLineaFilterChange = (linea) => {
    setLineaFilters((prev) => {
      if (prev.includes(linea)) {
        return prev.filter((l) => l !== linea);
      } else {
        return [...prev, linea];
      }
    });
    setPage(0); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setStatusFilters([]);
    setLineaFilters([]);
    setPage(0);
  };

  // Filter devices based on selected statuses and lineas
  let filteredDevices = devices;

  // Apply status filter
  if (statusFilters.length > 0) {
    filteredDevices = filteredDevices.filter((device) => statusFilters.includes(device.estado));
  }

  // Apply linea filter
  if (lineaFilters.length > 0) {
    filteredDevices = filteredDevices.filter((device) =>
      lineaFilters.includes(device.producto?.linea)
    );
  }

  // Calculate counts for status filter (based on linea filter)
  const devicesFilteredByLinea = lineaFilters.length > 0
    ? devices.filter((device) => lineaFilters.includes(device.producto?.linea))
    : devices;

  // Calculate counts for linea filter (based on status filter)
  const devicesFilteredByStatus = statusFilters.length > 0
    ? devices.filter((device) => statusFilters.includes(device.estado))
    : devices;

  // Get unique product types (lineas) from products
  const availableProductTypes = [...new Set(products.map(p => p.linea))].sort();

  // Get unique lineas from devices (for filtering)
  const deviceLineas = [...new Set(devices.map(d => d.producto?.linea).filter(Boolean))].sort();

  // Filter products based on selected product type
  const filteredProducts = selectedProductType
    ? products.filter(p => p.linea === selectedProductType)
    : products;

  // Handle product type change
  const handleProductTypeChange = (productType) => {
    setSelectedProductType(productType);
    // Clear product and color selection when product type changes
    setFormData({ ...formData, producto: '', color: '' });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'En Stock':
      case 'Pedido':
        return 'success';
      case 'Reservado':
        return 'warning';
      case 'Vendido':
        return 'default';
      case 'Baja':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      {/* Actions Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Dispositivos en Stock</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDevices}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nuevo Dispositivo
          </Button>
        </Box>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedDevices.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={500}>
              {selectedDevices.length} dispositivo(s) seleccionado(s)
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenBulkStatusDialog}
                size="small"
              >
                Cambiar Estado
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setSelectedDevices([])}
                size="small"
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Status Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight={500}>
            Filtrar por Estado
          </Typography>
        </Box>
        <FormGroup row>
          {DEVICE_STATES.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={statusFilters.includes(status)}
                  onChange={() => handleStatusFilterChange(status)}
                  size="small"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Chip
                    label={status}
                    size="small"
                    color={getStatusColor(status)}
                    variant={statusFilters.includes(status) ? 'filled' : 'outlined'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({devicesFilteredByLinea.filter((d) => d.estado === status).length})
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Paper>

      {/* Linea Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight={500}>
            Filtrar por Línea
          </Typography>
          {(statusFilters.length > 0 || lineaFilters.length > 0) && (
            <Button
              size="small"
              onClick={handleClearFilters}
              sx={{ textTransform: 'none' }}
            >
              Limpiar todos los filtros ({statusFilters.length + lineaFilters.length})
            </Button>
          )}
        </Box>
        <FormGroup row>
          {deviceLineas.map((linea) => (
            <FormControlLabel
              key={linea}
              control={
                <Checkbox
                  checked={lineaFilters.includes(linea)}
                  onChange={() => handleLineaFilterChange(linea)}
                  size="small"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Chip
                    label={linea}
                    size="small"
                    color="primary"
                    variant={lineaFilters.includes(linea) ? 'filled' : 'outlined'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({devicesFilteredByStatus.filter((d) => d.producto?.linea === linea).length})
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedDevices.length > 0 && selectedDevices.length < devices.length
                  }
                  checked={devices.length > 0 && selectedDevices.length === devices.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Imagen</TableCell>
              <TableCell>Línea</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Condición</TableCell>
              <TableCell>Batería</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {statusFilters.length > 0
                      ? 'No hay dispositivos que coincidan con los filtros seleccionados'
                      : 'No hay dispositivos registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((device) => (
                <TableRow
                  key={device._id}
                  hover
                  selected={selectedDevices.includes(device._id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDevices.includes(device._id)}
                      onChange={() => handleSelectDevice(device._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={getThumbnailUrl(device.imagenes?.[0] || '/placeholder-device.png')}
                      alt={device.producto?.modelo || 'Device'}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell>{device.producto?.linea || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {device.producto?.modelo || 'N/A'}
                    </Typography>
                    {device.grado && (
                      <Chip label={`Grado ${device.grado}`} size="small" sx={{ mt: 0.5 }} />
                    )}
                  </TableCell>
                  <TableCell>{device.color?.nombre || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={device.condicion} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {device.condicionBateria
                      ? `${(device.condicionBateria * 100).toFixed(0)}%`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <PriceDisplay
                      usdAmount={device.precio}
                      usdVariant="body2"
                      arsVariant="caption"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={device.estado}
                      size="small"
                      color={getStatusColor(device.estado)}
                    />
                    {device.estado === 'Vendido' && device.fechaVenta && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {format(new Date(device.fechaVenta.split('T')[0] + 'T12:00:00'), 'MMM yyyy', { locale: es })}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => window.open(`/dispositivo/${device._id}`, '_blank')}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(device)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(device)}
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
          count={filteredDevices.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
        />
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog && (dialogMode === 'create' || dialogMode === 'edit')}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Nuevo Dispositivo' : 'Editar Dispositivo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Información Básica */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Product Type Selection */}
            <Grid size={{ xs: 6 }}>
              <TextField
                select
                fullWidth
                label="Tipo de Producto"
                value={selectedProductType}
                onChange={(e) => handleProductTypeChange(e.target.value)}
                disabled={dialogMode === 'edit'}
                helperText={dialogMode === 'create' ? 'Selecciona el tipo de producto primero' : ''}
              >
                <MenuItem value="">
                  <em>Todos los tipos</em>
                </MenuItem>
                {availableProductTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                select
                fullWidth
                label="Producto"
                value={formData.producto}
                onChange={(e) => handleFormChange('producto', e.target.value)}
                disabled={dialogMode === 'edit'}
                helperText={!selectedProductType && dialogMode === 'create' ? 'Selecciona un tipo de producto primero' : ''}
              >
                {filteredProducts.map((product) => (
                  <MenuItem key={product._id} value={product.modelo}>
                    {product.modelo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6 }}>
              {(() => {
                // Filter colors based on selected product
                const selectedProduct = products.find(p => p.modelo === formData.producto);
                const productColorNames = selectedProduct?.colores?.map(c => c.nombre || c) || [];
                const availableColors = colors.filter(color => productColorNames.includes(color.nombre));
                const hasOnlyOneColor = availableColors.length === 1;
                const isDisabled = dialogMode === 'edit' || !formData.producto || hasOnlyOneColor;

                // Auto-select if only one color available
                if (hasOnlyOneColor && formData.color !== availableColors[0].nombre) {
                  setTimeout(() => handleFormChange('color', availableColors[0].nombre), 0);
                }

                // Determine helper text
                let helperText = '';
                if (!formData.producto) {
                  helperText = 'Primero selecciona un producto';
                } else if (hasOnlyOneColor) {
                  helperText = 'Único color disponible para este producto';
                }

                return (
                  <TextField
                    select
                    fullWidth
                    label="Color"
                    value={formData.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                    disabled={isDisabled}
                    helperText={helperText}
                  >
                    {availableColors.map((color) => (
                      <MenuItem key={color._id} value={color.nombre}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              bgcolor: color.hex,
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 1,
                            }}
                          />
                          {color.nombre}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                );
              })()}
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                select
                fullWidth
                label="Condición"
                value={formData.condicion}
                onChange={(e) => handleFormChange('condicion', e.target.value)}
                disabled={dialogMode === 'edit'}
              >
                {DEVICE_CONDITIONS.map((cond) => (
                  <MenuItem key={cond} value={cond}>{cond}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                select
                fullWidth
                label="Grado"
                value={formData.grado}
                onChange={(e) => handleFormChange('grado', e.target.value)}
                disabled={formData.condicion === 'Sellado'}
                helperText={formData.condicion === 'Sellado' ? 'Dispositivos sellados no tienen grado' : ''}
              >
                <MenuItem value="">Sin grado</MenuItem>
                {DEVICE_GRADES.map((grade) => (
                  <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={formData.estado}
                onChange={(e) => handleFormChange('estado', e.target.value)}
              >
                {DEVICE_STATES.map((state) => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Fecha de Venta - Only show when estado is Vendido */}
            {formData.estado === 'Vendido' && (
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Venta"
                  value={formData.fechaVenta}
                  onChange={(e) => handleFormChange('fechaVenta', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Se auto-completa con la fecha actual si se deja vacío"
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Condición Batería"
                value={formData.condicion === 'Sellado' ? '' : formData.condicionBateria}
                onChange={(e) => handleFormChange('condicionBateria', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 100, step: 1 }}
                disabled={formData.condicion === 'Sellado'}
                helperText={formData.condicion === 'Sellado'
                  ? "Los dispositivos sellados se asumen con 100% de batería"
                  : "Porcentaje de salud de batería (0-100)"}
              />
            </Grid>

            {/* Costos y Precio de Venta */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Costos y Precio de Venta
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Costo (USD)"
                value={formData.costo}
                onChange={(e) => handleFormChange('costo', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Precio (USD)"
                value={formData.precio}
                onChange={(e) => handleFormChange('precio', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Otros Datos */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Otros Datos
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 8 }}>
              {(() => {
                // Get unique locations from branches (Provincia, Ciudad)
                const locations = [...new Set(branches.map(b => `${b.provincia}, ${b.localidad}`))];
                const isDisabled = locations.length <= 1;

                // Auto-select if only one location
                if (isDisabled && locations.length === 1 && formData.ubicacion !== locations[0]) {
                  // This will trigger on next render
                  setTimeout(() => handleFormChange('ubicacion', locations[0]), 0);
                }

                return (
                  <TextField
                    select
                    fullWidth
                    label="Ubicación"
                    value={formData.ubicacion}
                    onChange={(e) => handleFormChange('ubicacion', e.target.value)}
                    disabled={isDisabled}
                    helperText={isDisabled && locations.length === 1 ? 'Única sucursal disponible' : ''}
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                  </TextField>
                );
              })()}
            </Grid>

            <Grid size={{ xs: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.canjeable}
                    onChange={(e) => handleFormChange('canjeable', e.target.checked)}
                  />
                }
                label="Acepta canje"
                sx={{ mt: 1 }}
              />
            </Grid>

            {/* Garantía */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Garantía
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {formData.condicion === 'Sellado' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Dispositivos sellados tienen garantía Apple estándar de 1 año que se activa al primer uso.
                  Puede dejar estos campos vacíos.
                </Alert>
              )}
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Garantía Apple"
                value={formData.garantiaApple}
                onChange={(e) => handleFormChange('garantiaApple', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={
                  formData.condicion === 'Sellado'
                    ? 'Opcional para dispositivos sellados'
                    : 'Debe tener solo garantía Apple o garantía propia'
                }
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                select
                fullWidth
                label="Garantía Propia"
                value={formData.garantiaPropia}
                onChange={(e) => handleFormChange('garantiaPropia', e.target.value)}
                helperText={
                  formData.condicion === 'Sellado'
                    ? 'Opcional para dispositivos sellados'
                    : ''
                }
              >
                <MenuItem value="">Sin garantía propia</MenuItem>
                {WARRANTY_OWN.map((warranty) => (
                  <MenuItem key={warranty} value={warranty}>{warranty}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Accesorios y Detalles */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Accesorios y Detalles
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Accesorios incluidos:
              </Typography>
              <FormGroup row>
                {ACCESSOIRES.map((acc) => (
                  <FormControlLabel
                    key={acc}
                    control={
                      <Checkbox
                        checked={formData.accesorios.includes(acc)}
                        onChange={(e) => {
                          const newAccs = e.target.checked
                            ? [...formData.accesorios, acc]
                            : formData.accesorios.filter(a => a !== acc);
                          handleFormChange('accesorios', newAccs);
                        }}
                      />
                    }
                    label={acc}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid size={{ xs: 12 }}>
              {openDialog && (
                <Autocomplete
                  multiple
                  freeSolo
                  options={Array.isArray(availableDetalles) ? availableDetalles : []}
                  value={Array.isArray(formData.detalles) ? formData.detalles : []}
                  onChange={(event, newValue) => {
                    handleFormChange('detalles', Array.isArray(newValue) ? newValue : []);
                  }}
                  getOptionLabel={(option) => typeof option === 'string' ? option : ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Detalles del dispositivo"
                      placeholder="Agregar detalle (rayones, líneas, etc.)"
                      helperText="Escriba un detalle personalizado o seleccione de la lista"
                    />
                  )}
                />
              )}
            </Grid>

            {/* Image Upload Section - Only for edit mode */}
            {dialogMode === 'edit' && selectedDevice && (
              <>
                <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Imágenes del Dispositivo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Imágenes actuales ({existingImages.length}/5)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      {existingImages.map((imageUrl, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 120,
                            height: 120,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Device ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'error.main', color: 'white' },
                            }}
                            onClick={() => handleRemoveExistingImage(imageUrl)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* New Images to Upload */}
                {selectedImages.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Imágenes para subir ({selectedImages.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      {selectedImages.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 120,
                            height: 120,
                            border: '2px dashed',
                            borderColor: 'primary.main',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'error.main', color: 'white' },
                            }}
                            onClick={() => handleRemoveSelectedImage(index)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleUploadImages}
                      disabled={uploadingImages}
                      fullWidth
                    >
                      {uploadingImages ? 'Subiendo...' : `Subir ${selectedImages.length} imagen${selectedImages.length !== 1 ? 'es' : ''}`}
                    </Button>
                  </Grid>
                )}

                {/* Upload Button */}
                {existingImages.length + selectedImages.length < 5 && (
                  <Grid size={{ xs: 12 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<ImageIcon />}
                      fullWidth
                    >
                      Seleccionar Imágenes
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                      Máximo 5 imágenes. {5 - (existingImages.length + selectedImages.length)} restantes.
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
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
            ¿Está seguro de que desea eliminar este dispositivo?
          </Typography>
          {selectedDevice && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {selectedDevice.producto?.modelo || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedDevice.color?.nombre} - {selectedDevice.condicion}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Status Update Dialog */}
      <Dialog open={bulkStatusDialogOpen} onClose={handleCloseBulkStatusDialog} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle>Cambiar Estado de Dispositivos</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Se actualizará el estado de {selectedDevices.length} dispositivo(s) seleccionado(s).
            </Typography>
            <TextField
              select
              fullWidth
              label="Nuevo Estado"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              sx={{ mt: 2 }}
            >
              {DEVICE_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkStatusDialog}>Cancelar</Button>
          <Button onClick={handleBulkStatusUpdate} variant="contained" color="primary">
            Actualizar
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

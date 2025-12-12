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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../../api/products';

const PRODUCT_LINES = ['iPhone', 'MacBook', 'iPad', 'Watch', 'AirPods', 'Otros'];

/**
 * ProductsTab - CRUD interface for managing product models
 */
export const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit' | 'delete'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    marca: 'Apple',
    linea: '',
    modelo: '',
    colores: [],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter state
  const [searchModel, setSearchModel] = useState('');
  const [filterLine, setFilterLine] = useState('');

  // Fetch products and colors
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchProducts();
    fetchColors();
  }, [fetchProducts, fetchColors]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setSelectedProduct(null);
    setFormData({
      marca: 'Apple',
      linea: '',
      modelo: '',
      colores: [],
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (product) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setFormData({
      marca: product.marca,
      linea: product.linea,
      modelo: product.modelo,
      colores: product.colores?.map(c => c._id || c) || [],
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (product) => {
    setDialogMode('delete');
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
      // Convert _id → nombre
      const selectedColorNames = formData.colores.map(colorId => {
        const color = colors.find(c => c._id === colorId);
        return color ? color.nombre : null;
      }).filter(Boolean);

      await productsAPI.createProduct({
        ...formData,
        colores: selectedColorNames  // send names instead of ids
      });
        showSnackbar('Producto creado exitosamente');
      } else if (dialogMode === 'edit') {
        // Convert _id → nombre
        const selectedColorNames = formData.colores.map(colorId => {
          const color = colors.find(c => c._id === colorId);
          return color ? color.nombre : null;
        }).filter(Boolean);
        //console.log(selectedColorNames);
      
        // Only send colors array for edit
        await productsAPI.updateProduct(selectedProduct._id, {
          colores: selectedColorNames
        });
        showSnackbar('Producto actualizado exitosamente');
      }
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al guardar producto',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    try {
      await productsAPI.deleteProduct(selectedProduct._id);
      showSnackbar('Producto eliminado exitosamente');
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar(
        error.response?.data?.message || 'Error al eliminar producto',
        'error'
      );
    }
  };

  // Filter products based on search and line filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchModel === '' ||
      product.modelo.toLowerCase().includes(searchModel.toLowerCase());
    const matchesLine = filterLine === '' || product.linea === filterLine;
    return matchesSearch && matchesLine;
  });

  const handleClearFilters = () => {
    setSearchModel('');
    setFilterLine('');
  };

  return (
    <Box>
      {/* Actions Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Productos (Modelos)</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProducts}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FilterIcon color="action" />
          <TextField
            size="small"
            placeholder="Buscar por modelo..."
            value={searchModel}
            onChange={(e) => setSearchModel(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Línea</InputLabel>
            <Select
              value={filterLine}
              label="Línea"
              onChange={(e) => setFilterLine(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {PRODUCT_LINES.map((line) => (
                <MenuItem key={line} value={line}>
                  {line}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(searchModel || filterLine) && (
            <Button
              size="small"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${filteredProducts.length} de ${products.length} productos`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Marca</TableCell>
              <TableCell>Línea</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Colores Disponibles</TableCell>
              <TableCell width={120} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {products.length === 0
                      ? 'No hay productos registrados'
                      : 'No se encontraron productos con los filtros aplicados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>{product.marca}</TableCell>
                  <TableCell>
                    <Chip label={product.linea} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {product.modelo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {product.colores?.map((color) => {
                        // Calculate contrasting text color based on background
                        const hexToRgb = (hex) => {
                          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                          return result ? {
                            r: parseInt(result[1], 16),
                            g: parseInt(result[2], 16),
                            b: parseInt(result[3], 16)
                          } : null;
                        };

                        const getContrastColor = (hexColor) => {
                          const rgb = hexToRgb(hexColor);
                          if (!rgb) return '#000';
                          // Calculate luminance
                          const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
                          return luminance > 0.5 ? '#000' : '#fff';
                        };

                        return (
                          <Tooltip key={color._id} title={color.nombre}>
                            <Chip
                              label={color.nombre}
                              size="small"
                              sx={{
                                backgroundColor: `${color.hex} !important`,
                                color: `${getContrastColor(color.hex)} !important`,
                                border: '1px solid',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                  color: `${getContrastColor(color.hex)} !important`,
                                },
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                      {(!product.colores || product.colores.length === 0) && (
                        <Typography variant="caption" color="text.secondary">
                          Sin colores
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(product)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(product)}
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
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {dialogMode === 'create' ? (
              <>
                <TextField
                  fullWidth
                  label="Marca"
                  value={formData.marca}
                  disabled
                  helperText="La marca es siempre Apple (no editable)"
                />
                <FormControl fullWidth>
                  <InputLabel>Línea de Producto</InputLabel>
                  <Select
                    value={formData.linea}
                    label="Línea de Producto"
                    onChange={(e) => handleFormChange('linea', e.target.value)}
                  >
                    {PRODUCT_LINES.map((line) => (
                      <MenuItem key={line} value={line}>
                        {line}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Modelo"
                  value={formData.modelo}
                  onChange={(e) => handleFormChange('modelo', e.target.value)}
                  placeholder="Ej: iPhone 15 Pro Max"
                  helperText="El modelo debe ser único"
                />
              </>
            ) : (
              <>
                <Alert severity="info">
                  Marca, Línea y Modelo no son editables. Solo puede editar los colores disponibles.
                </Alert>
                <TextField
                  fullWidth
                  label="Modelo"
                  value={formData.modelo}
                  disabled
                />
              </>
            )}

            <FormControl fullWidth>
              <InputLabel>Colores Disponibles</InputLabel>
              <Select
                multiple
                value={formData.colores}
                onChange={(e) => handleFormChange('colores', e.target.value)}
                input={<OutlinedInput label="Colores Disponibles" />}
                renderValue={(selected) => {
                  const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16)
                    } : null;
                  };

                  const getContrastColor = (hexColor) => {
                    const rgb = hexToRgb(hexColor);
                    if (!rgb) return '#000';
                    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
                    return luminance > 0.5 ? '#000' : '#fff';
                  };

                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((colorId) => {
                        const color = colors.find(c => c._id === colorId);
                        return color ? (
                          <Chip
                            key={colorId}
                            label={color.nombre}
                            size="small"
                            sx={{
                              backgroundColor: `${color.hex} !important`,
                              color: `${getContrastColor(color.hex)} !important`,
                              border: '1px solid',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                color: `${getContrastColor(color.hex)} !important`,
                              },
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  );
                }}
              >
                {colors.map((color) => (
                  <MenuItem key={color._id} value={color._id}>
                    <Checkbox checked={formData.colores.indexOf(color._id) > -1} />
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: color.hex,
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: 1,
                        mr: 1,
                      }}
                    />
                    <ListItemText primary={color.nombre} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            ¿Está seguro de que desea eliminar este producto?
          </Typography>
          {selectedProduct && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight={500}>
                {selectedProduct.modelo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedProduct.marca} - {selectedProduct.linea}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            No se puede eliminar un producto que tenga dispositivos asociados.
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

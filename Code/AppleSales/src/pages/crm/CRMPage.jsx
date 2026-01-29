import { useState, useEffect, useMemo, useCallback } from 'react';
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
  TableSortLabel,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  InputAdornment,
  Collapse,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  MoreHoriz as MoreHorizIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { crmAPI } from '../../api/crm';
import {
  CRM_STATUS_LABELS,
  CRM_STATUS_COLORS,
  REDES_SOCIALES,
} from '../../constants';
import { gradientTextSilver } from '../../theme';

// Social network icons mapping
const getSocialIcon = (redSocial) => {
  const icons = {
    'Instagram': <InstagramIcon fontSize="small" />,
    'Facebook': <FacebookIcon fontSize="small" />,
    'WhatsApp': <WhatsAppIcon fontSize="small" />,
    'Teléfono': <PhoneIcon fontSize="small" />,
    'Email': <EmailIcon fontSize="small" />,
    'Presencial': <PersonIcon fontSize="small" />,
    'Web': <LanguageIcon fontSize="small" />,
    'Otro': <MoreHorizIcon fontSize="small" />,
  };
  return icons[redSocial] || <MoreHorizIcon fontSize="small" />;
};

// Status chip colors
const getStatusColor = (estado) => {
  const colors = {
    'Nuevo lead': '#2196f3',
    'Interesado': '#9c27b0',
    'En evaluación': '#ff9800',
    'Negociación/Cierre': '#673ab7',
    'Venta concretada/Postventa': '#4caf50',
    'Lead frío': '#9e9e9e',
    'Perdido': '#f44336',
  };
  return colors[estado] || '#9e9e9e';
};

const CRM_ESTADOS = [
  'Nuevo lead',
  'Interesado',
  'En evaluación',
  'Negociación/Cierre',
  'Venta concretada/Postventa',
  'Lead frío',
  'Perdido'
];

/**
 * CRMPage - Complete CRM management interface
 */
const CRMPage = () => {
  const theme = useTheme();

  // Data state
  const [crms, setCrms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Sorting state
  const [orderBy, setOrderBy] = useState('fechaUltimoContacto');
  const [order, setOrder] = useState('desc');

  // Filter state
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    usuario: '',
    estado: '',
    redSocial: '',
    requiereHumano: '',
  });

  // Selection state for bulk operations
  const [selected, setSelected] = useState([]);

  // Dialog state
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openBulkStatusDialog, setOpenBulkStatusDialog] = useState(false);

  // Selected CRM
  const [selectedCRM, setSelectedCRM] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    usuario: '',
    redSocial: 'Instagram',
    idRedSocial: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    intereses: '',
    notas: '',
  });

  // Status change state
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch CRMs
  const fetchCRMs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
      };

      if (filters.usuario) params.usuario = filters.usuario;
      if (filters.estado) params.estado = filters.estado;
      if (filters.redSocial) params.redSocial = filters.redSocial;
      if (filters.requiereHumano !== '') params.requiereHumano = filters.requiereHumano;

      const response = await crmAPI.getAll(params);
      setCrms(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching CRMs:', error);
      showSnackbar('Error al cargar leads', 'error');
      setCrms([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order, filters]);

  useEffect(() => {
    fetchCRMs();
  }, [fetchCRMs]);

  // Handlers
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(crms.map(crm => crm._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const resetForm = () => {
    setFormData({
      usuario: '',
      redSocial: 'Instagram',
      idRedSocial: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      email: '',
      intereses: '',
      notas: '',
    });
  };

  // View CRM
  const handleView = (crm) => {
    setSelectedCRM(crm);
    setOpenViewDialog(true);
  };

  // Edit CRM
  const handleEdit = (crm) => {
    setSelectedCRM(crm);
    setFormData({
      usuario: crm.usuario || '',
      redSocial: crm.redSocial || 'Instagram',
      idRedSocial: crm.idRedSocial || '',
      nombres: crm.nombres || '',
      apellidos: crm.apellidos || '',
      telefono: crm.telefono || '',
      email: crm.email || '',
      intereses: crm.intereses || '',
      notas: crm.notas || '',
    });
    setOpenEditDialog(true);
  };

  // Create CRM
  const handleCreate = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // Status change
  const handleStatusClick = (crm) => {
    setSelectedCRM(crm);
    setNewStatus('');
    setStatusNotes('');
    setOpenStatusDialog(true);
  };

  // Bulk status change
  const handleBulkStatus = () => {
    setNewStatus('');
    setStatusNotes('');
    setOpenBulkStatusDialog(true);
  };

  // Delete CRM
  const handleDelete = (crm) => {
    setSelectedCRM(crm);
    setOpenDeleteDialog(true);
  };

  // Toggle requiereHumano
  const handleToggleHumano = async (crm) => {
    try {
      await crmAPI.toggleRequiereHumano(crm._id, !crm.requiereHumano);
      showSnackbar(
        crm.requiereHumano
          ? 'Bandera "Requiere humano" desactivada'
          : 'Bandera "Requiere humano" activada'
      );
      fetchCRMs();
    } catch (error) {
      showSnackbar('Error al cambiar bandera', 'error');
    }
  };

  // Submit create
  const handleCreateSubmit = async () => {
    try {
      await crmAPI.create(formData);
      showSnackbar('Lead creado exitosamente');
      setOpenCreateDialog(false);
      fetchCRMs();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al crear lead', 'error');
    }
  };

  // Submit edit
  const handleEditSubmit = async () => {
    try {
      await crmAPI.update(selectedCRM._id, formData);
      showSnackbar('Lead actualizado exitosamente');
      setOpenEditDialog(false);
      fetchCRMs();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al actualizar lead', 'error');
    }
  };

  // Submit status change
  const handleStatusSubmit = async () => {
    try {
      await crmAPI.changeStatus(selectedCRM._id, newStatus, statusNotes);
      showSnackbar('Estado actualizado exitosamente');
      setOpenStatusDialog(false);
      fetchCRMs();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Error al cambiar estado',
        'error'
      );
    }
  };

  // Submit bulk status change
  const handleBulkStatusSubmit = async () => {
    try {
      const response = await crmAPI.bulkChangeStatus(selected, newStatus, statusNotes);
      showSnackbar(response.message);
      setOpenBulkStatusDialog(false);
      setSelected([]);
      fetchCRMs();
    } catch (error) {
      showSnackbar('Error al cambiar estados', 'error');
    }
  };

  // Submit delete
  const handleDeleteSubmit = async () => {
    try {
      await crmAPI.delete(selectedCRM._id);
      showSnackbar('Lead eliminado exitosamente');
      setOpenDeleteDialog(false);
      fetchCRMs();
    } catch (error) {
      showSnackbar('Error al eliminar lead', 'error');
    }
  };

  // Count by status for filter badges
  const statusCounts = useMemo(() => {
    const counts = {};
    CRM_ESTADOS.forEach(estado => {
      counts[estado] = crms.filter(c => c.estado === estado).length;
    });
    return counts;
  }, [crms]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ ...gradientTextSilver }}>
            Gestión de Leads / CRM
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra tus leads y su progreso en el embudo de ventas
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refrescar">
            <IconButton onClick={fetchCRMs} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Nuevo Lead
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={showFilters ? 2 : 0}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon />
            <Typography variant="subtitle1">Filtros</Typography>
            <Chip label={`${total} leads`} size="small" color="primary" />
          </Box>
          <IconButton onClick={() => setShowFilters(!showFilters)} size="small">
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid size={{ xs:12, sm:6, md:3 }} >
              <TextField
                fullWidth
                size="small"
                label="Buscá usuario"
                value={filters.usuario}
                onChange={(e) => handleFilterChange('usuario', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {CRM_ESTADOS.map(estado => (
                    <MenuItem key={estado} value={estado}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: getStatusColor(estado),
                          }}
                        />
                        {CRM_STATUS_LABELS[estado]}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Red Social</InputLabel>
                <Select
                  value={filters.redSocial}
                  onChange={(e) => handleFilterChange('redSocial', e.target.value)}
                  label="Red Social"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {REDES_SOCIALES.map(red => (
                    <MenuItem key={red} value={red}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getSocialIcon(red)}
                        {red}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Requiere Humano</InputLabel>
                <Select
                  value={filters.requiereHumano}
                  onChange={(e) => handleFilterChange('requiereHumano', e.target.value)}
                  label="Requiere Humano"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">
                    <Box display="flex" alignItems="center" gap={1}>
                      <WarningIcon fontSize="small" color="warning" />
                      Sí, requiere atención
                    </Box>
                  </MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>
              {selected.length} lead(s) seleccionado(s)
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={handleBulkStatus}
              >
                Cambiar Estado
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelected([])}
              >
                Deseleccionar
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < crms.length}
                    checked={crms.length > 0 && selected.length === crms.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'usuario'}
                    direction={orderBy === 'usuario' ? order : 'asc'}
                    onClick={() => handleSort('usuario')}
                  >
                    Usuario
                  </TableSortLabel>
                </TableCell>
                <TableCell>Red Social</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'estado'}
                    direction={orderBy === 'estado' ? order : 'asc'}
                    onClick={() => handleSort('estado')}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                <TableCell>Intereses</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'fechaUltimoContacto'}
                    direction={orderBy === 'fechaUltimoContacto' ? order : 'asc'}
                    onClick={() => handleSort('fechaUltimoContacto')}
                  >
                    Último Contacto
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Humano</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : crms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No se encontraron leads
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                crms.map((crm) => (
                  <TableRow
                    key={crm._id}
                    hover
                    selected={selected.includes(crm._id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(crm._id)}
                        onChange={() => handleSelectOne(crm._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {crm.usuario}
                        </Typography>
                        {(crm.nombres || crm.apellidos) && (
                          <Typography variant="caption" color="text.secondary">
                            {[crm.nombres, crm.apellidos].filter(Boolean).join(' ')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSocialIcon(crm.redSocial)}
                        label={crm.redSocial}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={CRM_STATUS_LABELS[crm.estado]}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(crm.estado),
                          color: 'white',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleStatusClick(crm)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {crm.intereses || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {crm.fechaUltimoContacto
                        ? format(new Date(crm.fechaUltimoContacto), 'dd/MM/yyyy HH:mm', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={crm.requiereHumano ? 'Requiere atención humana' : 'Atendido por bot'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleHumano(crm)}
                          color={crm.requiereHumano ? 'warning' : 'default'}
                        >
                          {crm.requiereHumano ? <WarningIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleView(crm)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(crm)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleDelete(crm)} color="error">
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
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Lead</DialogTitle>
        <DialogContent dividers>
          {selectedCRM && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Información de Contacto
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getSocialIcon(selectedCRM.redSocial)}
                      <Typography variant="body1" fontWeight={500}>
                        @{selectedCRM.usuario}
                      </Typography>
                    </Box>
                    {selectedCRM.nombres && (
                      <Typography variant="body2">
                        <strong>Nombre:</strong> {selectedCRM.nombres} {selectedCRM.apellidos}
                      </Typography>
                    )}
                    {selectedCRM.telefono && (
                      <Typography variant="body2">
                        <strong>Teléfono:</strong> {selectedCRM.telefono}
                      </Typography>
                    )}
                    {selectedCRM.email && (
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedCRM.email}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Estado Actual
                    </Typography>
                    <Box mb={1}>
                      <Chip
                        label={CRM_STATUS_LABELS[selectedCRM.estado]}
                        sx={{
                          bgcolor: getStatusColor(selectedCRM.estado),
                          color: 'white',
                        }}
                      />
                      {selectedCRM.requiereHumano && (
                        <Chip
                          icon={<WarningIcon />}
                          label="Requiere Humano"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2">
                      <strong>Último contacto:</strong>{' '}
                      {selectedCRM.fechaUltimoContacto
                        ? format(new Date(selectedCRM.fechaUltimoContacto), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
                        : '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Creado:</strong>{' '}
                      {selectedCRM.createdAt
                        ? format(new Date(selectedCRM.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })
                        : '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {selectedCRM.intereses && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Intereses
                      </Typography>
                      <Typography variant="body2">{selectedCRM.intereses}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedCRM.notas && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notas
                      </Typography>
                      <Typography variant="body2">{selectedCRM.notas}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedCRM.historialEstados && selectedCRM.historialEstados.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Historial de Estados
                      </Typography>
                      {selectedCRM.historialEstados.map((h, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            py: 0.5,
                            borderBottom: idx < selectedCRM.historialEstados.length - 1 ? 1 : 0,
                            borderColor: 'divider',
                          }}
                        >
                          <Chip
                            label={CRM_STATUS_LABELS[h.estado]}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(h.estado),
                              color: 'white',
                              minWidth: 120,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(h.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                          </Typography>
                          {h.notas && (
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                              {h.notas}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false);
              handleEdit(selectedCRM);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openCreateDialog || openEditDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setOpenEditDialog(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {openCreateDialog ? 'Nuevo Lead' : 'Editar Lead'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Usuario / Handle"
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                required
                disabled={openEditDialog}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Red Social</InputLabel>
                <Select
                  value={formData.redSocial}
                  onChange={(e) => setFormData({ ...formData, redSocial: e.target.value })}
                  label="Red Social"
                  disabled={openEditDialog}
                >
                  {REDES_SOCIALES.map(red => (
                    <MenuItem key={red} value={red}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getSocialIcon(red)}
                        {red}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombres"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellidos"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Intereses"
                value={formData.intereses}
                onChange={(e) => setFormData({ ...formData, intereses: e.target.value })}
                placeholder="ej: iPhone 15 Pro Max, Mac Mini M4"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCreateDialog(false);
            setOpenEditDialog(false);
          }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={openCreateDialog ? handleCreateSubmit : handleEditSubmit}
            disabled={!formData.usuario}
          >
            {openCreateDialog ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar Estado</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Estado actual: <Chip
              label={selectedCRM ? CRM_STATUS_LABELS[selectedCRM.estado] : ''}
              size="small"
              sx={{
                bgcolor: selectedCRM ? getStatusColor(selectedCRM.estado) : 'grey',
                color: 'white',
              }}
            />
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nuevo Estado</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Nuevo Estado"
            >
              {CRM_ESTADOS.filter(e => e !== selectedCRM?.estado).map(estado => (
                <MenuItem key={estado} value={estado}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(estado),
                      }}
                    />
                    {CRM_STATUS_LABELS[estado]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notas (opcional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleStatusSubmit}
            disabled={!newStatus}
          >
            Cambiar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Status Change Dialog */}
      <Dialog open={openBulkStatusDialog} onClose={() => setOpenBulkStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar Estado de {selected.length} Lead(s)</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nuevo Estado</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Nuevo Estado"
            >
              {CRM_ESTADOS.map(estado => (
                <MenuItem key={estado} value={estado}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(estado),
                      }}
                    />
                    {CRM_STATUS_LABELS[estado]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notas (opcional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkStatusDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleBulkStatusSubmit}
            disabled={!newStatus}
          >
            Cambiar Todos
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el lead de{' '}
            <strong>{selectedCRM?.usuario}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSubmit}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CRMPage;

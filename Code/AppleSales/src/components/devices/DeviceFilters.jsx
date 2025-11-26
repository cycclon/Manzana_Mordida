import { useState } from 'react';

import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DEVICE_CONDITIONS, STORAGE_OPTIONS, DEVICE_CONDITION_LABELS } from '../../constants';

/**
 * DeviceFilters - Filter devices by various criteria
 */
export const DeviceFilters = ({ filters, onFiltersChange, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (event, newValue) => {
    const newFilters = {
      ...localFilters,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    };
    setLocalFilters(newFilters);
    // Only update parent on mouse up to avoid excessive re-renders
  };

  const handlePriceCommit = (event, newValue) => {
    const newFilters = {
      ...localFilters,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    };
    onFiltersChange(newFilters);
  };

  const handleBatteryChange = (event, newValue) => {
    const newFilters = {
      ...localFilters,
      minBattery: newValue,
    };
    setLocalFilters(newFilters);
  };

  const handleBatteryCommit = (event, newValue) => {
    const newFilters = {
      ...localFilters,
      minBattery: newValue,
    };
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    const emptyFilters = {
      search: '',
      condition: '',
      storage: '',
      minPrice: 0,
      maxPrice: 5000,
      minBattery: 0,
    };
    setLocalFilters(emptyFilters);
    onClear(emptyFilters);
  };

  const hasActiveFilters =
    localFilters.search ||
    localFilters.condition ||
    localFilters.storage ||
    localFilters.minPrice > 0 ||
    localFilters.maxPrice < 5000 ||
    localFilters.minBattery > 0;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Typography variant="h6">Filtros</Typography>
          {hasActiveFilters && (
            <Chip label="Activos" size="small" color="primary" />
          )}
        </Box>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Limpiar
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Search */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Buscar modelo"
            placeholder="iPhone 15 Pro..."
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            size="small"
          />
        </Grid>

        {/* Storage */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Almacenamiento</InputLabel>
            <Select
              value={localFilters.storage || ''}
              label="Almacenamiento"
              onChange={(e) => handleChange('storage', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {STORAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Condition */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Condición</InputLabel>
            <Select
              value={localFilters.condition || ''}
              label="Condición"
              onChange={(e) => handleChange('condition', e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {Object.entries(DEVICE_CONDITION_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Advanced Filters - Accordion */}
        <Grid size={{ xs: 12 }}>
          <Accordion elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Filtros Avanzados</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Price Range */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography gutterBottom variant="body2">
                    Rango de Precio (USD)
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={[localFilters.minPrice || 0, localFilters.maxPrice || 5000]}
                      onChange={handlePriceChange}
                      onChangeCommitted={handlePriceCommit}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5000}
                      step={50}
                      marks={[
                        { value: 0, label: '$0' },
                        { value: 2500, label: '$2500' },
                        { value: 5000, label: '$5000' },
                      ]}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    ${localFilters.minPrice || 0} - ${localFilters.maxPrice || 5000}
                  </Typography>
                </Grid>

                {/* Battery Health */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography gutterBottom variant="body2">
                    Salud de Batería Mínima: {localFilters.minBattery || 0}%
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={localFilters.minBattery || 0}
                      onChange={handleBatteryChange}
                      onChangeCommitted={handleBatteryCommit}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      step={5}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' },
                      ]}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DeviceFilters;

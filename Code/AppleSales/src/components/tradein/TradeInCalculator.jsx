import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Collapse,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { tradeinAPI } from '../../api/tradein';
import { useTradeIn } from '../../hooks/useTradeIn';
import { PriceDisplay } from '../common/PriceDisplay';
import { toast } from 'react-hot-toast';

/**
 * TradeInCalculator - Sticky calculator for trade-in value estimation
 * Allows users to select their device and see trade-in value
 */
export const TradeInCalculator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setTradeInDevice, tradeInDevice, clearTradeIn, hasTradeIn } = useTradeIn();

  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Form state
  const [productLines, setProductLines] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [batteryHealth, setBatteryHealth] = useState(80);
  const [calculatedValue, setCalculatedValue] = useState(null);

  // Fetch product lines on mount
  useEffect(() => {
    const fetchLines = async () => {
      setLoading(true);
      try {
        const lines = await tradeinAPI.getProductLines();
        setProductLines(lines);
      } catch (error) {
        console.error('Error fetching product lines:', error);
        toast.error('Error al cargar líneas de productos');
      } finally {
        setLoading(false);
      }
    };

    fetchLines();
  }, []);

  // Fetch models when line changes
  useEffect(() => {
    if (!selectedLine) {
      setModels([]);
      setSelectedModel('');
      return;
    }

    const fetchModels = async () => {
      setLoading(true);
      try {
        const modelsList = await tradeinAPI.getModelsByLine(selectedLine);
        setModels(modelsList);
        setSelectedModel('');
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Error al cargar modelos');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedLine]);

  // Calculate trade-in value
  const handleCalculate = async () => {
    if (!selectedLine || !selectedModel) {
      toast.error('Por favor selecciona línea y modelo');
      return;
    }

    setCalculating(true);
    try {
      const value = await tradeinAPI.calculateTradeInValue(
        selectedLine,
        selectedModel,
        batteryHealth
      );

      setCalculatedValue(value);

      if (value > 0) {
        toast.success(`Valor de canje: $${value} USD`);
      } else {
        toast.error('No hay precio de canje disponible para esta configuración');
      }
    } catch (error) {
      console.error('Error calculating trade-in:', error);
      toast.error('Error al calcular valor de canje');
    } finally {
      setCalculating(false);
    }
  };

  // Apply trade-in value
  const handleApply = () => {
    if (calculatedValue > 0) {
      setTradeInDevice({
        linea: selectedLine,
        modelo: selectedModel,
        batteryHealth: batteryHealth,
        valuation: calculatedValue,
      });
      toast.success('Valor de canje aplicado a los precios');
      setIsExpanded(false);
    }
  };

  // Clear trade-in
  const handleClear = () => {
    clearTradeIn();
    setCalculatedValue(null);
    setSelectedLine('');
    setSelectedModel('');
    setBatteryHealth(80);
    toast.success('Valor de canje eliminado');
  };

  // Reset form
  const handleReset = () => {
    setSelectedLine('');
    setSelectedModel('');
    setBatteryHealth(80);
    setCalculatedValue(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 64, // Below header
        zIndex: 1000,
        borderRadius: 0,
        borderBottom: isExpanded ? `2px solid ${theme.palette.primary.main}` : 'none',
      }}
    >
      {/* Collapsed header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          py: 1.5,
          bgcolor: hasTradeIn ? 'success.light' : 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: hasTradeIn ? 'success.main' : 'grey.100',
          },
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalculateIcon color={hasTradeIn ? 'success' : 'primary'} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Calculadora de Canje
            </Typography>
            {hasTradeIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" color="success" />
                <Typography variant="body2" color="text.secondary">
                  Canje activo: ${tradeInDevice?.valuation} USD - {tradeInDevice?.modelo}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {isMobile
                  ? 'Toca para calcular'
                  : 'Calcula el valor de tu dispositivo usado'}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasTradeIn && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Expanded calculator */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: 'background.paper' }}>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            Selecciona tu dispositivo usado y su condición de batería para calcular el
            valor de canje. El descuento se aplicará automáticamente a todos los precios.
          </Alert>

          {/* Form */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Product Line */}
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Línea de Producto</InputLabel>
              <Select
                value={selectedLine}
                label="Línea de Producto"
                onChange={(e) => setSelectedLine(e.target.value)}
              >
                {productLines.map((line) => (
                  <MenuItem key={line} value={line}>
                    {line}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Model */}
            <FormControl fullWidth disabled={!selectedLine || loading}>
              <InputLabel>Modelo</InputLabel>
              <Select
                value={selectedModel}
                label="Modelo"
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Battery Health */}
            <TextField
              fullWidth
              type="number"
              label="Salud de Batería (%)"
              value={batteryHealth}
              onChange={(e) =>
                setBatteryHealth(Math.min(100, Math.max(0, Number(e.target.value))))
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
            />
          </Box>

          {/* Battery slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ajusta la salud de batería:
            </Typography>
            <Slider
              value={batteryHealth}
              onChange={(e, value) => setBatteryHealth(value)}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 80, label: '80%' },
                { value: 100, label: '100%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Box>

          {/* Result */}
          {calculatedValue !== null && (
            <Alert
              severity={calculatedValue > 0 ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              {calculatedValue > 0 ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor de canje calculado:
                  </Typography>
                  <PriceDisplay
                    usdAmount={calculatedValue}
                    usdVariant="h6"
                    arsVariant="body2"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
                  >
                    * Precio estimado y sujeto a revisión presencial en nuestras oficinas.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">
                  No hay precio de canje disponible para esta configuración.
                  Intenta con otra combinación o contacta con nosotros.
                </Typography>
              )}
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={
                calculating ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />
              }
              onClick={handleCalculate}
              disabled={!selectedLine || !selectedModel || calculating}
            >
              {calculating ? 'Calculando...' : 'Calcular Valor'}
            </Button>

            {calculatedValue !== null && calculatedValue > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApply}
                disabled={hasTradeIn && tradeInDevice?.valuation === calculatedValue}
              >
                {hasTradeIn && tradeInDevice?.valuation === calculatedValue ? 'Aplicado' : 'Aplicar Canje'}
              </Button>
            )}

            <Button variant="outlined" onClick={handleReset}>
              Limpiar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TradeInCalculator;

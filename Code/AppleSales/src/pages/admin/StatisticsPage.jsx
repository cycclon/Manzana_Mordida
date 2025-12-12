import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { productsAPI } from '../../api/products';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { gradientTextSilver } from '../../theme';

// Chart colors - distinctive colors for pie chart
const COLORS = ['#e31837', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#ffeb3b', '#795548'];
const PROFIT_COLORS = {
  high: '#4caf50',
  medium: '#ff9800',
  low: '#f44336',
};

/**
 * StatisticsPage - Analytics dashboard with sales metrics and Pareto charts
 */
const StatisticsPage = () => {
  const theme = useTheme();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('12'); // months
  const [selectedLinea, setSelectedLinea] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [chartType, setChartType] = useState('bar');

  // Sorting state for monthly details table
  const [monthlyOrderBy, setMonthlyOrderBy] = useState('month');
  const [monthlyOrder, setMonthlyOrder] = useState('desc');

  // Sorting state for sales details table
  const [salesOrderBy, setSalesOrderBy] = useState('fecha');
  const [salesOrder, setSalesOrder] = useState('desc');

  // Fetch all devices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAllDevices();
        setDevices(data || []);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get sold devices within date range
  const soldDevices = useMemo(() => {
    const monthsAgo = parseInt(dateRange);
    const startDate = startOfMonth(subMonths(new Date(), monthsAgo - 1));
    const endDate = endOfMonth(new Date());

    return devices.filter(device => {
      if (device.estado !== 'Vendido' || !device.fechaVenta) return false;

      const saleDate = new Date(device.fechaVenta.split('T')[0] + 'T12:00:00');
      const isInRange = isWithinInterval(saleDate, { start: startDate, end: endDate });
      const matchesLinea = selectedLinea === 'all' || device.producto?.linea === selectedLinea;
      const matchesModel = selectedModel === 'all' || device.producto?.modelo === selectedModel;

      return isInRange && matchesLinea && matchesModel;
    });
  }, [devices, dateRange, selectedLinea, selectedModel]);

  // Get unique product lines
  const productLines = useMemo(() => {
    const lines = [...new Set(devices.map(d => d.producto?.linea).filter(Boolean))];
    return lines.sort();
  }, [devices]);

  // Get unique models (filtered by selected line)
  const productModels = useMemo(() => {
    const filteredDevices = selectedLinea === 'all'
      ? devices
      : devices.filter(d => d.producto?.linea === selectedLinea);
    const models = [...new Set(filteredDevices.map(d => d.producto?.modelo).filter(Boolean))];
    return models.sort();
  }, [devices, selectedLinea]);

  // Reset model filter when line changes
  const handleLineaChange = (newLinea) => {
    setSelectedLinea(newLinea);
    setSelectedModel('all');
  };

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const monthsAgo = parseInt(dateRange);
    const stats = [];

    for (let i = monthsAgo - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthDevices = soldDevices.filter(device => {
        const saleDate = new Date(device.fechaVenta.split('T')[0] + 'T12:00:00');
        return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
      });

      const quantity = monthDevices.length;
      const totalRevenue = monthDevices.reduce((sum, d) => sum + (d.precio || 0), 0);
      const totalCost = monthDevices.reduce((sum, d) => sum + (d.costo || 0), 0);
      const profit = totalRevenue - totalCost;
      const profitPercentage = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

      stats.push({
        month: format(monthDate, 'MMM yy', { locale: es }),
        monthFull: format(monthDate, 'MMMM yyyy', { locale: es }),
        quantity,
        revenue: totalRevenue,
        cost: totalCost,
        profit,
        profitPercentage: Math.round(profitPercentage),
      });
    }

    return stats;
  }, [soldDevices, dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    const quantity = soldDevices.length;
    const revenue = soldDevices.reduce((sum, d) => sum + (d.precio || 0), 0);
    const cost = soldDevices.reduce((sum, d) => sum + (d.costo || 0), 0);
    const profit = revenue - cost;
    const profitPercentage = cost > 0 ? ((profit / cost) * 100) : 0;
    const avgTicket = quantity > 0 ? revenue / quantity : 0;

    return { quantity, revenue, cost, profit, profitPercentage, avgTicket };
  }, [soldDevices]);

  // Top 5 most profitable products (by profit percentage)
  const topProfitableProducts = useMemo(() => {
    const productStats = {};

    soldDevices.forEach(device => {
      const model = device.producto?.modelo || 'Desconocido';
      const linea = device.producto?.linea || '';
      const key = `${linea} ${model}`;

      if (!productStats[key]) {
        productStats[key] = { name: key, linea, model, totalProfit: 0, totalCost: 0, quantity: 0 };
      }

      productStats[key].totalProfit += (device.precio || 0) - (device.costo || 0);
      productStats[key].totalCost += device.costo || 0;
      productStats[key].quantity += 1;
    });

    return Object.values(productStats)
      .filter(p => p.totalCost > 0)
      .map(p => ({
        ...p,
        profitPercentage: Math.round((p.totalProfit / p.totalCost) * 100),
      }))
      .sort((a, b) => b.profitPercentage - a.profitPercentage)
      .slice(0, 5);
  }, [soldDevices]);

  // Top 5 most sold models (by quantity)
  const topSoldModels = useMemo(() => {
    const productStats = {};

    soldDevices.forEach(device => {
      const model = device.producto?.modelo || 'Desconocido';
      const linea = device.producto?.linea || '';
      const key = `${linea} ${model}`;

      if (!productStats[key]) {
        productStats[key] = { name: key, linea, model, quantity: 0, revenue: 0 };
      }

      productStats[key].quantity += 1;
      productStats[key].revenue += device.precio || 0;
    });

    const sorted = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate cumulative percentage for Pareto
    const totalQuantity = sorted.reduce((sum, p) => sum + p.quantity, 0);
    let cumulative = 0;

    return sorted.map(p => {
      cumulative += p.quantity;
      return {
        ...p,
        percentage: Math.round((p.quantity / totalQuantity) * 100),
        cumulative: Math.round((cumulative / totalQuantity) * 100),
      };
    });
  }, [soldDevices]);

  // Sales by product line
  const salesByLine = useMemo(() => {
    const lineStats = {};

    soldDevices.forEach(device => {
      const linea = device.producto?.linea || 'Otros';

      if (!lineStats[linea]) {
        lineStats[linea] = { name: linea, quantity: 0, revenue: 0, profit: 0 };
      }

      lineStats[linea].quantity += 1;
      lineStats[linea].revenue += device.precio || 0;
      lineStats[linea].profit += (device.precio || 0) - (device.costo || 0);
    });

    return Object.values(lineStats).sort((a, b) => b.quantity - a.quantity);
  }, [soldDevices]);

  // Current inventory stats
  const inventoryStats = useMemo(() => {
    const inStock = devices.filter(d => d.estado === 'En Stock');
    const reserved = devices.filter(d => d.estado === 'Reservado');
    const totalValue = inStock.reduce((sum, d) => sum + (d.precio || 0), 0);
    const totalCost = inStock.reduce((sum, d) => sum + (d.costo || 0), 0);

    return {
      inStock: inStock.length,
      reserved: reserved.length,
      totalValue,
      potentialProfit: totalValue - totalCost,
    };
  }, [devices]);

  const getProfitColor = (percentage) => {
    if (percentage < 0) return '#f44336'; // Red for negative
    if (percentage >= 30) return '#2e7d32'; // Dark green for high margin
    if (percentage >= 15) return '#4caf50'; // Medium green
    return '#81c784'; // Light green for low positive
  };

  // Sorting handlers
  const handleMonthlySort = (property) => {
    const isAsc = monthlyOrderBy === property && monthlyOrder === 'asc';
    setMonthlyOrder(isAsc ? 'desc' : 'asc');
    setMonthlyOrderBy(property);
  };

  const handleSalesSort = (property) => {
    const isAsc = salesOrderBy === property && salesOrder === 'asc';
    setSalesOrder(isAsc ? 'desc' : 'asc');
    setSalesOrderBy(property);
  };

  // Sorted monthly stats
  const sortedMonthlyStats = useMemo(() => {
    const comparator = (a, b) => {
      let aVal, bVal;
      switch (monthlyOrderBy) {
        case 'month':
          // Use index for month sorting (original order is chronological)
          return monthlyOrder === 'asc' ? 0 : 0; // Keep original order, handled differently
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case 'revenue':
          aVal = a.revenue;
          bVal = b.revenue;
          break;
        case 'cost':
          aVal = a.cost;
          bVal = b.cost;
          break;
        case 'profit':
          aVal = a.profit;
          bVal = b.profit;
          break;
        case 'profitPercentage':
          aVal = a.profitPercentage;
          bVal = b.profitPercentage;
          break;
        default:
          return 0;
      }
      if (monthlyOrder === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    };

    if (monthlyOrderBy === 'month') {
      return monthlyOrder === 'asc' ? [...monthlyStats] : [...monthlyStats].reverse();
    }
    return [...monthlyStats].sort(comparator);
  }, [monthlyStats, monthlyOrderBy, monthlyOrder]);

  // Sorted and enriched sales data
  const sortedSalesData = useMemo(() => {
    const enrichedData = soldDevices.map(device => {
      const cost = device.costo || 0;
      const price = device.precio || 0;
      const profit = price - cost;
      const marginPercent = cost > 0 ? Math.round((profit / cost) * 100) : 0;
      const saleDate = new Date(device.fechaVenta.split('T')[0] + 'T12:00:00');
      return {
        ...device,
        cost,
        price,
        profit,
        marginPercent,
        saleDate,
        linea: device.producto?.linea || '-',
        modelo: device.producto?.modelo || '-',
      };
    });

    const comparator = (a, b) => {
      let aVal, bVal;
      switch (salesOrderBy) {
        case 'fecha':
          aVal = a.saleDate.getTime();
          bVal = b.saleDate.getTime();
          break;
        case 'linea':
          aVal = a.linea.toLowerCase();
          bVal = b.linea.toLowerCase();
          return salesOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'modelo':
          aVal = a.modelo.toLowerCase();
          bVal = b.modelo.toLowerCase();
          return salesOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'cost':
          aVal = a.cost;
          bVal = b.cost;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'profit':
          aVal = a.profit;
          bVal = b.profit;
          break;
        case 'marginPercent':
          aVal = a.marginPercent;
          bVal = b.marginPercent;
          break;
        default:
          return 0;
      }
      if (salesOrder === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    };

    return enrichedData.sort(comparator);
  }, [soldDevices, salesOrderBy, salesOrder]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <AssessmentIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' }, ...gradientTextSilver }}>
            Reportes y Estadísticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análisis de ventas, rentabilidad e inventario
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Período</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Período"
              >
                <MenuItem value="3">Últimos 3 meses</MenuItem>
                <MenuItem value="6">Últimos 6 meses</MenuItem>
                <MenuItem value="12">Últimos 12 meses</MenuItem>
                <MenuItem value="24">Últimos 24 meses</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Línea</InputLabel>
              <Select
                value={selectedLinea}
                onChange={(e) => handleLineaChange(e.target.value)}
                label="Línea"
              >
                <MenuItem value="all">Todas las líneas</MenuItem>
                {productLines.map(line => (
                  <MenuItem key={line} value={line}>{line}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Modelo</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                label="Modelo"
              >
                <MenuItem value="all">Todos los modelos</MenuItem>
                {productModels.map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={12} md={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">Datos:</Typography>
              <Chip
                label={`${soldDevices.length} ventas`}
                size="small"
                color="primary"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {totals.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unidades Vendidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <MoneyIcon sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
              <PriceDisplay usdAmount={totals.revenue} usdVariant="h5" showARS={false} />
              <Typography variant="body2" color="text.secondary">
                Ingresos Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrendingUpIcon sx={{ color: getProfitColor(totals.profitPercentage), fontSize: 32, mb: 1 }} />
              <PriceDisplay usdAmount={totals.profit} usdVariant="h5" showARS={false} />
              <Typography variant="body2" color="text.secondary">
                Ganancia Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: getProfitColor(totals.profitPercentage) }}>
                {totals.profitPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Margen s/ Costo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PriceDisplay usdAmount={totals.avgTicket} usdVariant="h5" showARS={false} />
              <Typography variant="body2" color="text.secondary">
                Ticket Promedio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Quantity Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
          Unidades Vendidas por Mes
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
              formatter={(value) => [value, 'Unidades']}
            />
            <Bar dataKey="quantity" name="Unidades" fill="#e31837" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Monthly Financial Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ ...gradientTextSilver }}>
            Ingresos y Ganancia por Mes
          </Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, value) => value && setChartType(value)}
            size="small"
          >
            <ToggleButton value="bar">Barras</ToggleButton>
            <ToggleButton value="line">Líneas</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? (
            <ComposedChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis yAxisId="left" stroke={theme.palette.text.secondary} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                formatter={(value, name) => {
                  if (name === 'Margen %') return [`${value}%`, name];
                  return [`$${value.toLocaleString()}`, name];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Ingresos" fill="#2196f3" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="profit" name="Ganancia" fill="#4caf50" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="profitPercentage" name="Margen %" stroke="#ff9800" strokeWidth={2} dot />
            </ComposedChart>
          ) : (
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#2196f3" strokeWidth={2} dot />
              <Line type="monotone" dataKey="profit" name="Ganancia" stroke="#4caf50" strokeWidth={2} dot />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Paper>

      {/* Pareto Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
        {/* Top Profitable Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
              Top 5 - Mayor Rentabilidad (% Margen)
            </Typography>
            {topProfitableProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProfitableProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis type="number" stroke={theme.palette.text.secondary} unit="%" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      formatter={(value) => [`${value}%`, 'Margen']}
                    />
                    <Bar dataKey="profitPercentage" name="Margen %">
                      {topProfitableProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getProfitColor(entry.profitPercentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="right">Cant.</TableCell>
                        <TableCell align="right">Margen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProfitableProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{product.name}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${product.profitPercentage}%`}
                              size="small"
                              sx={{
                                bgcolor: getProfitColor(product.profitPercentage),
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No hay datos suficientes
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Sold Models - Pareto */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
              Top 5 - Más Vendidos (Pareto)
            </Typography>
            {topSoldModels.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={topSoldModels}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      formatter={(value, name) => {
                        if (name === 'Acumulado') return [`${value}%`, name];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="quantity" name="Cantidad" fill="#e31837" />
                    <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Acumulado" stroke="#ff9800" strokeWidth={2} dot />
                  </ComposedChart>
                </ResponsiveContainer>
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="right">Cant.</TableCell>
                        <TableCell align="right">%</TableCell>
                        <TableCell align="right">Acum.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topSoldModels.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{product.name}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">{product.percentage}%</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${product.cumulative}%`}
                              size="small"
                              color={product.cumulative <= 80 ? 'primary' : 'default'}
                              variant={product.cumulative <= 80 ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No hay datos suficientes
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Sales by Product Line & Inventory Status */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Sales by Line */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
            Ventas por Línea de Producto
          </Typography>
          {salesByLine.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={salesByLine}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="quantity"
                  nameKey="name"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {salesByLine.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                  }}
                  itemStyle={{
                    color: theme.palette.text.primary,
                  }}
                  formatter={(value, name, props) => [
                    `${value} unidades - $${props.payload.revenue.toLocaleString()}`,
                    props.payload.name
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No hay datos suficientes
            </Typography>
          )}
        </Paper>

        {/* Inventory Status */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
            Estado del Inventario
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <InventoryIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {inventoryStats.inStock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En Stock
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <ShoppingCartIcon sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {inventoryStats.reserved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reservados
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Valor en Stock
                </Typography>
                <PriceDisplay usdAmount={inventoryStats.totalValue} usdVariant="h5" showARS={false} />
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ganancia Potencial
                </Typography>
                <PriceDisplay usdAmount={inventoryStats.potentialProfit} usdVariant="h5" showARS={false} />
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Box>

      {/* Monthly Details Table */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
          Detalle Mensual
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={monthlyOrderBy === 'month'}
                    direction={monthlyOrderBy === 'month' ? monthlyOrder : 'asc'}
                    onClick={() => handleMonthlySort('month')}
                  >
                    Mes
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={monthlyOrderBy === 'quantity'}
                    direction={monthlyOrderBy === 'quantity' ? monthlyOrder : 'asc'}
                    onClick={() => handleMonthlySort('quantity')}
                  >
                    Cantidad
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={monthlyOrderBy === 'revenue'}
                    direction={monthlyOrderBy === 'revenue' ? monthlyOrder : 'asc'}
                    onClick={() => handleMonthlySort('revenue')}
                  >
                    Ingresos
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={monthlyOrderBy === 'cost'}
                    direction={monthlyOrderBy === 'cost' ? monthlyOrder : 'asc'}
                    onClick={() => handleMonthlySort('cost')}
                  >
                    Costo
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={monthlyOrderBy === 'profit'}
                    direction={monthlyOrderBy === 'profit' ? monthlyOrder : 'asc'}
                    onClick={() => handleMonthlySort('profit')}
                  >
                    Ganancia
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={monthlyOrderBy === 'profitPercentage'}
                    direction={monthlyOrderBy === 'profitPercentage' ? monthlyOrder : 'asc'}
                    onClick={() => handleMonthlySort('profitPercentage')}
                  >
                    Margen %
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedMonthlyStats.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{row.monthFull}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right">
                    <PriceDisplay usdAmount={row.revenue} usdVariant="body2" showARS={false} />
                  </TableCell>
                  <TableCell align="right">
                    <PriceDisplay usdAmount={row.cost} usdVariant="body2" showARS={false} />
                  </TableCell>
                  <TableCell align="right">
                    <PriceDisplay usdAmount={row.profit} usdVariant="body2" showARS={false} />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${row.profitPercentage}%`}
                      size="small"
                      sx={{
                        bgcolor: row.quantity > 0 ? getProfitColor(row.profitPercentage) : 'grey.500',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{totals.quantity}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <PriceDisplay usdAmount={totals.revenue} usdVariant="body2" showARS={false} />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <PriceDisplay usdAmount={totals.cost} usdVariant="body2" showARS={false} />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <PriceDisplay usdAmount={totals.profit} usdVariant="body2" showARS={false} />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${totals.profitPercentage.toFixed(1)}%`}
                    size="small"
                    sx={{
                      bgcolor: getProfitColor(totals.profitPercentage),
                      color: 'white',
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detailed Sales Table */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ ...gradientTextSilver }}>
          Detalle de Ventas
        </Typography>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={salesOrderBy === 'fecha'}
                    direction={salesOrderBy === 'fecha' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('fecha')}
                  >
                    Fecha
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={salesOrderBy === 'linea'}
                    direction={salesOrderBy === 'linea' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('linea')}
                  >
                    Línea
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={salesOrderBy === 'modelo'}
                    direction={salesOrderBy === 'modelo' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('modelo')}
                  >
                    Modelo
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={salesOrderBy === 'cost'}
                    direction={salesOrderBy === 'cost' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('cost')}
                  >
                    Costo
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={salesOrderBy === 'price'}
                    direction={salesOrderBy === 'price' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('price')}
                  >
                    Precio
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={salesOrderBy === 'profit'}
                    direction={salesOrderBy === 'profit' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('profit')}
                  >
                    Ganancia
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={salesOrderBy === 'marginPercent'}
                    direction={salesOrderBy === 'marginPercent' ? salesOrder : 'asc'}
                    onClick={() => handleSalesSort('marginPercent')}
                  >
                    Margen %
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSalesData.map((device, index) => (
                <TableRow key={device._id || index} hover>
                  <TableCell>
                    {format(device.saleDate, 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{device.linea}</TableCell>
                  <TableCell>{device.modelo}</TableCell>
                  <TableCell align="right">
                    <PriceDisplay usdAmount={device.cost} usdVariant="body2" showARS={false} />
                  </TableCell>
                  <TableCell align="right">
                    <PriceDisplay usdAmount={device.price} usdVariant="body2" showARS={false} />
                  </TableCell>
                  <TableCell align="right">
                    <PriceDisplay usdAmount={device.profit} usdVariant="body2" showARS={false} />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${device.marginPercent}%`}
                      size="small"
                      sx={{
                        bgcolor: getProfitColor(device.marginPercent),
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 50,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {sortedSalesData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay ventas en el período seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default StatisticsPage;

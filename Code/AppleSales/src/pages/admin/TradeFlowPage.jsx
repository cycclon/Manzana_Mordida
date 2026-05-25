import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  AccountTree as FlowIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { tradeFlowAPI } from '../../api/tradeFlow';
import { handleApiError } from '../../api/client';
import { TradeFlowDiagram, deviceName } from '../../components/tradeflow/TradeFlowDiagram';
import { gradientTextSilver, gradientTextPrice } from '../../theme';

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

// ---------------------------------------------------------------------------
// Index view: list of chains
// ---------------------------------------------------------------------------

const FlowList = () => {
  const navigate = useNavigate();
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('profit');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tradeFlowAPI.getFlujos({ sort, limit: 100 });
      setChains(res.data || []);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => { load(); }, [load]);

  const totalInvested = chains.reduce((s, c) => s + (c.summary?.invested || 0), 0);
  const totalRealized = chains.reduce((s, c) => s + (c.summary?.realizedProfit || 0), 0);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <FlowIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main' }} />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' }, ...gradientTextSilver }}>
            Flujo de Canjes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cada cadena nace en una compra a proveedor y se ramifica con los canjes hasta cerrarse en una venta sin canje.
          </Typography>
        </Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/admin')} variant="outlined">
          Panel
        </Button>
      </Box>

      {/* Aggregate */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">CADENAS</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{chains.length}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">TOTAL INVERTIDO</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmtUSD(totalInvested)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">GANANCIA REALIZADA</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, ...gradientTextPrice }}>
            {totalRealized >= 0 ? '+' : ''}{fmtUSD(totalRealized)}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', alignSelf: 'center' }}>
          <ToggleButtonGroup
            size="small"
            value={sort}
            exclusive
            onChange={(_e, v) => v && setSort(v)}
          >
            <ToggleButton value="profit">Ganancia</ToggleButton>
            <ToggleButton value="roi">ROI</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : chains.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FlowIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" gutterBottom>Aún no hay cadenas de canje</Typography>
          <Typography variant="body2" color="text.secondary">
            Se generan al completar una venta y vincular el equipo recibido en canje.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dispositivo raíz (proveedor)</TableCell>
                <TableCell align="right">Invertido</TableCell>
                <TableCell align="right">Ganancia realizada</TableCell>
                <TableCell align="right">ROI</TableCell>
                <TableCell align="center">Dispositivos</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chains.map((c) => (
                <TableRow
                  key={c.rootEquipoId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/flujo/${c.rootEquipoId}`)}
                >
                  <TableCell>{deviceName(c.rootEquipo)}</TableCell>
                  <TableCell align="right">{fmtUSD(c.summary.invested)}</TableCell>
                  <TableCell align="right">
                    <Typography component="span" sx={{ fontWeight: 700, ...gradientTextPrice }}>
                      {c.summary.realizedProfit >= 0 ? '+' : ''}{fmtUSD(c.summary.realizedProfit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {c.summary.roi != null ? `${(c.summary.roi * 100).toFixed(1)}%` : '—'}
                  </TableCell>
                  <TableCell align="center">{c.summary.deviceCount}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={c.summary.status === 'closed' ? 'Cerrada' : 'Abierta'}
                      color={c.summary.status === 'closed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

// ---------------------------------------------------------------------------
// Detail view: the flow diagram for one chain
// ---------------------------------------------------------------------------

const FlowDetail = ({ equipoId }) => {
  const navigate = useNavigate();
  const [flujo, setFlujo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await tradeFlowAPI.getFlujo(equipoId);
        if (active) setFlujo(res.data);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [equipoId]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/flujo')} variant="outlined">
          Cadenas
        </Button>
        <Typography variant="h5" sx={{ ...gradientTextSilver }}>Flujo de la cadena</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !flujo || !flujo.nodes?.length ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No se pudo construir el flujo para este dispositivo.
          </Typography>
        </Paper>
      ) : (
        <TradeFlowDiagram flujo={flujo} key={flujo.rootEquipoId} />
      )}
    </Container>
  );
};

// ---------------------------------------------------------------------------
// Page entry: list or detail by route param
// ---------------------------------------------------------------------------

export const TradeFlowPage = () => {
  const { equipoId } = useParams();
  return equipoId ? <FlowDetail equipoId={equipoId} /> : <FlowList />;
};

export default TradeFlowPage;

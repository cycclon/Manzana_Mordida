import { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Drawer,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Inventory2 as DeviceIcon } from '@mui/icons-material';
import { gradientTextPrice, gradientTextSilver } from '../../theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const deviceName = (equipo) => {
  if (!equipo) return 'Equipo no disponible';
  const p = equipo.producto || {};
  const parts = [p.marca, p.linea, p.modelo].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Equipo';
};

const estadoColor = (estado) => {
  switch (estado) {
    case 'Vendido': return 'success';
    case 'En Stock': return 'info';
    case 'Reservado': return 'warning';
    case 'Baja': return 'error';
    default: return 'default';
  }
};

const VERTICAL_GAP = 230;
const HORIZONTAL_GAP = 320;

// ---------------------------------------------------------------------------
// Custom node: a device card in the chain
// ---------------------------------------------------------------------------

const DeviceFlowNode = ({ data }) => {
  const { node } = data;
  const { equipo, acquisition, sold, costo, precio, profit } = node;
  const positive = profit >= 0;

  return (
    <Paper
      elevation={3}
      sx={{
        width: 270,
        p: 1.5,
        border: '1px solid',
        borderColor: acquisition === 'provider' ? 'primary.main' : 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.light', boxShadow: '0 0 16px rgba(227,24,55,0.35)' },
      }}
    >
      {/* connection handles (top = incoming canje, bottom = outgoing canje) */}
      <Handle type="target" position={Position.Top} style={{ background: '#e31837', border: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#e31837', border: 'none' }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {deviceName(equipo)}
        </Typography>
        <Chip
          size="small"
          label={acquisition === 'provider' ? 'Proveedor' : 'Canje'}
          color={acquisition === 'provider' ? 'primary' : 'default'}
          variant={acquisition === 'provider' ? 'filled' : 'outlined'}
          sx={{ height: 20, fontSize: 10 }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={sold ? 'Vendido' : (equipo?.estado || 'Sin venta')}
          color={sold ? 'success' : estadoColor(equipo?.estado)}
          variant="outlined"
          sx={{ height: 20, fontSize: 10 }}
        />
        {equipo?.condicion && (
          <Chip size="small" label={equipo.condicion} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Costo</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtUSD(costo)}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            {sold ? 'Venta' : 'Precio'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtUSD(precio)}</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 0.75, textAlign: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, ...(positive ? gradientTextPrice : {}), color: positive ? undefined : 'error.main' }}
        >
          {positive ? '+' : ''}{fmtUSD(profit)} {sold ? '' : '(proyectado)'}
        </Typography>
      </Box>
    </Paper>
  );
};

const nodeTypes = { device: DeviceFlowNode };

// ---------------------------------------------------------------------------
// Summary bar
// ---------------------------------------------------------------------------

const Stat = ({ label, children }) => (
  <Box sx={{ minWidth: 110 }}>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

const SummaryBar = ({ summary, rootEquipo }) => {
  const roiPct = summary.roi != null ? `${(summary.roi * 100).toFixed(1)}%` : '—';
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <DeviceIcon color="primary" />
        <Typography variant="h6" sx={{ ...gradientTextSilver }}>
          Cadena de: {deviceName(rootEquipo)}
        </Typography>
        <Chip
          size="small"
          label={summary.status === 'closed' ? 'Cerrada' : 'Abierta'}
          color={summary.status === 'closed' ? 'success' : 'warning'}
          sx={{ ml: 'auto' }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Stat label="Invertido">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmtUSD(summary.invested)}</Typography>
        </Stat>
        <Stat label="Ganancia realizada">
          <Typography variant="h6" sx={{ fontWeight: 800, ...gradientTextPrice }}>
            {summary.realizedProfit >= 0 ? '+' : ''}{fmtUSD(summary.realizedProfit)}
          </Typography>
        </Stat>
        <Stat label="Ganancia proyectada">
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {summary.projectedProfit >= 0 ? '+' : ''}{fmtUSD(summary.projectedProfit)}
          </Typography>
        </Stat>
        <Stat label="ROI">
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.light' }}>{roiPct}</Typography>
        </Stat>
        <Stat label="Dispositivos">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{summary.deviceCount}</Typography>
        </Stat>
      </Box>
    </Paper>
  );
};

// ---------------------------------------------------------------------------
// Node detail drawer
// ---------------------------------------------------------------------------

const NodeDetailDrawer = ({ node, onClose }) => {
  const equipo = node?.equipo;
  return (
    <Drawer anchor="right" open={!!node} onClose={onClose}>
      <Box sx={{ width: { xs: 300, sm: 360 }, p: 2.5 }} role="presentation">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ ...gradientTextSilver }}>{deviceName(equipo)}</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {node && (
          <Stack spacing={1.25}>
            <Detail label="Origen" value={node.acquisition === 'provider' ? 'Compra a proveedor' : 'Recibido en canje'} />
            <Detail label="Estado" value={node.sold ? 'Vendido' : (equipo?.estado || '—')} />
            <Detail label="Condición" value={equipo?.condicion || '—'} />
            <Detail label="Grado" value={equipo?.grado || '—'} />
            <Detail
              label="Batería"
              value={equipo?.condicionBateria != null ? `${Math.round(equipo.condicionBateria * 100)}%` : '—'}
            />
            <Detail label="Color" value={equipo?.color?.nombre || '—'} />
            <Detail label="Ubicación" value={equipo?.ubicacion || '—'} />
            <Divider />
            <Detail label="Costo" value={fmtUSD(node.costo)} />
            <Detail label={node.sold ? 'Precio de venta' : 'Precio de lista'} value={fmtUSD(node.precio)} />
            <Detail label="Ganancia" value={`${node.profit >= 0 ? '+' : ''}${fmtUSD(node.profit)}`} />
            {node.fechaVenta && (
              <>
                <Divider />
                {/* local-noon parse: evita el corrimiento de 1 día por timezone */}
                <Detail
                  label="Fecha de venta"
                  value={new Date(node.fechaVenta.split('T')[0] + 'T12:00:00').toLocaleDateString('es-AR')}
                />
              </>
            )}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

const Detail = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
  </Box>
);

// ---------------------------------------------------------------------------
// Main diagram
// ---------------------------------------------------------------------------

export const TradeFlowDiagram = ({ flujo }) => {
  const initialNodes = useMemo(
    () =>
      (flujo?.nodes || []).map((n, i) => ({
        id: String(n.equipoId),
        type: 'device',
        // Layout by chain depth (y) and sibling index (x). A linear chain stays
        // in one column; branches (a sale that produced multiple trade-ins) fan out.
        position: { x: (n.xIndex ?? 0) * HORIZONTAL_GAP, y: (n.depth ?? i) * VERTICAL_GAP },
        data: { node: n },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      })),
    [flujo]
  );

  const initialEdges = useMemo(
    () =>
      (flujo?.edges || []).map((e) => ({
        id: `${e.from}-${e.to}`,
        source: String(e.from),
        target: String(e.to),
        type: 'smoothstep',
        animated: true,
        label: `Canje: ${fmtUSD(e.tradeInCredit)}`,
        labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 12 },
        labelBgStyle: { fill: '#1a1a1a' },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#e31837' },
        style: { stroke: '#e31837', strokeWidth: 2 },
      })),
    [flujo]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState(null);

  // Keep the canvas in sync if the chain changes without remount.
  useEffect(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);
  useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);

  return (
    <Box>
      <SummaryBar summary={flujo.summary} rootEquipo={flujo.nodes?.[0]?.equipo} />
      <Box
        sx={{
          height: { xs: 460, md: 'calc(100vh - 340px)' },
          minHeight: 460,
          width: '100%',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#0a0a0a',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_e, node) => setSelected(node.data.node)}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesConnectable={false}
          minZoom={0.2}
        >
          <Background color="#333" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Box>
      <NodeDetailDrawer node={selected} onClose={() => setSelected(null)} />
    </Box>
  );
};

export default TradeFlowDiagram;

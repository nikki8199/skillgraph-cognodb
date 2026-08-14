import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Stack
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RefreshIcon from '@mui/icons-material/Refresh';
import ForceGraph2D from 'force-graph';
import api from '../services/api';
import NodeDetailsModal from './NodeDetailsModal';
import { ErrorBanner } from './StateHandler';

const NODE_COLORS = {
  Person: '#6366f1',
  Skill: '#10b981',
  Company: '#f59e0b',
  Location: '#06b6d4',
  Project: '#ec4899'
};

export default function GraphVisualizer() {
  const containerRef = useRef(null);
  const graphInstanceRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGraph();
      setGraphData(res.data || { nodes: [], links: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  useEffect(() => {
    if (!containerRef.current || loading || graphData.nodes.length === 0) return;

    // Destroy previous graph instance if any
    if (graphInstanceRef.current) {
      graphInstanceRef.current._destructor?.();
      containerRef.current.innerHTML = '';
    }

    const width = containerRef.current.clientWidth || 800;
    const height = 550;

    const Graph = ForceGraph2D()(containerRef.current)
      .width(width)
      .height(height)
      .graphData(graphData)
      .nodeId('id')
      .nodeLabel((node) => `${node.label}: ${node.properties?.name || node.properties?.city || node.id}`)
      .nodeColor((node) => NODE_COLORS[node.label] || '#9ca3af')
      .nodeRelSize(7)
      .linkLabel((link) => link.type)
      .linkColor(() => 'rgba(255, 255, 255, 0.2)')
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(2)
      .linkDirectionalParticleSpeed(0.005)
      .onNodeClick((node) => {
        setSelectedNode(node);
      });

    graphInstanceRef.current = Graph;

    return () => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current._destructor?.();
      }
    };
  }, [graphData, loading]);

  const handleResetZoom = () => {
    if (graphInstanceRef.current) {
      graphInstanceRef.current.zoomToFit(400);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <AccountTreeIcon sx={{ color: '#818cf8', fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
                Interactive <span className="gradient-text">Graph Visualizer</span>
              </Typography>
            </Box>
            <Typography variant="body1" color="#9ca3af" sx={{ maxWidth: 750 }}>
              Live 2D force-directed rendering of nodes and edges directly from CognoDB over Bolt protocol. Click any node to inspect properties.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetZoom}
            sx={{ color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.4)', borderRadius: 2, textTransform: 'none' }}
          >
            Reset Camera
          </Button>
        </Box>
      </Paper>

      {/* Legend Bar */}
      <Paper className="glass-card" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
          <Typography variant="caption" color="#9ca3af" fontWeight={700} mr={1}>
            NODE LABELS:
          </Typography>
          {Object.entries(NODE_COLORS).map(([label, color]) => (
            <Chip key={label} label={label} size="small" sx={{ bgcolor: color, color: '#ffffff', fontWeight: 700 }} />
          ))}
        </Stack>
      </Paper>

      {/* Canvas Canvas Container */}
      <Paper
        className="glass-card"
        sx={{
          p: 1,
          minHeight: 550,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {loading ? (
          <CircularProgress sx={{ color: '#6366f1' }} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchGraph} />
        ) : (
          <Box ref={containerRef} sx={{ width: '100%', height: 550 }} />
        )}
      </Paper>

      {/* Node Details Modal */}
      <NodeDetailsModal node={selectedNode} open={Boolean(selectedNode)} onClose={() => setSelectedNode(null)} />
    </Container>
  );
}

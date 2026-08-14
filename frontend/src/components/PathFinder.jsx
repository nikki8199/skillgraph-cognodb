import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../services/api';
import { LoadingSkeleton, EmptyState, ErrorBanner } from './StateHandler';

export default function PathFinder({ peopleList = [] }) {
  const [fromUser, setFromUser] = useState(peopleList[0] || null);
  const [toUser, setToUser] = useState(peopleList[3] || peopleList[1] || null);
  const [pathResult, setPathResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFindPath = async () => {
    if (!fromUser || !toUser) return;
    if (fromUser.id === toUser.id) {
      setError('Please select two different professionals to find a connection path.');
      setPathResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getConnectionPath(fromUser.id, toUser.id);
      setPathResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromUser && toUser && fromUser.id !== toUser.id) {
      handleFindPath();
    }
  }, [fromUser, toUser]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(244, 114, 182, 0.3)',
          borderRadius: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <AltRouteIcon sx={{ color: '#f472b6', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Shortest Connection <span className="gradient-text">Path Finder</span>
          </Typography>
        </Box>
        <Typography variant="body1" color="#9ca3af" sx={{ maxWidth: 750 }}>
          Find the shortest introduction path between any two professionals in the graph and see the intermediate contacts connecting them.
        </Typography>
      </Paper>

      {/* Control Panel */}
      <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              select
              label="Source Professional (From)"
              value={fromUser?.id || ''}
              onChange={(e) => {
                const u = peopleList.find((p) => p.id === e.target.value);
                if (u) setFromUser(u);
              }}
              fullWidth
              size="small"
              sx={{
                bgcolor: 'rgba(31, 41, 55, 0.6)',
                borderRadius: 2,
                select: { color: '#f3f4f6' },
                label: { color: '#9ca3af' },
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
              }}
            >
              {peopleList.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.title})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              select
              label="Target Professional (To)"
              value={toUser?.id || ''}
              onChange={(e) => {
                const u = peopleList.find((p) => p.id === e.target.value);
                if (u) setToUser(u);
              }}
              fullWidth
              size="small"
              sx={{
                bgcolor: 'rgba(31, 41, 55, 0.6)',
                borderRadius: 2,
                select: { color: '#f3f4f6' },
                label: { color: '#9ca3af' },
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
              }}
            >
              {peopleList.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.title})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleFindPath}
              disabled={loading}
              sx={{
                bgcolor: '#ec4899',
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#db2777' }
              }}
            >
              {loading ? 'Finding...' : 'Find Path'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Path Display Content */}
      {loading ? (
        <LoadingSkeleton count={2} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={handleFindPath} />
      ) : pathResult ? (
        !pathResult.connected ? (
          <EmptyState
            title="No Connection Path Exists"
            message={`No KNOWS relationship path was found connecting ${fromUser?.name} and ${toUser?.name} within 5 degrees.`}
          />
        ) : (
          <Paper className="glass-card" sx={{ p: { xs: 3, md: 5 }, borderLeft: '6px solid #f472b6' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="#ffffff">
                  Path Discovered: {pathResult.fromName} <ArrowRightAltIcon sx={{ verticalAlign: 'middle', color: '#f472b6' }} /> {pathResult.toName}
                </Typography>
                <Typography variant="body2" color="#9ca3af">
                  Shortest path traversal length in CognoDB graph
                </Typography>
              </Box>
              <Chip
                icon={<CheckCircleOutlineIcon />}
                label={`Connection Distance: ${pathResult.distance} Hop${pathResult.distance > 1 ? 's' : ''}`}
                color="secondary"
                sx={{ fontWeight: 700, px: 1, py: 2.5, borderRadius: 2 }}
              />
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 4 }} />

            {/* Visual Timeline Network Chain */}
            <Stack spacing={2} alignItems="center">
              {pathResult.pathNodes && pathResult.pathNodes.map((node, index) => {
                const isFirst = index === 0;
                const isLast = index === pathResult.pathNodes.length - 1;
                const edge = pathResult.pathEdges && pathResult.pathEdges[index];

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <Card
                      sx={{
                        width: '100%',
                        maxWidth: 550,
                        bgcolor: isFirst ? 'rgba(99, 102, 241, 0.15)' : isLast ? 'rgba(52, 211, 153, 0.15)' : 'rgba(31, 41, 55, 0.6)',
                        border: isFirst ? '1px solid #6366f1' : isLast ? '1px solid #10b981' : '1px solid #374151',
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={node.avatarUrl} alt={node.name} sx={{ width: 50, height: 50, border: isFirst ? '2px solid #6366f1' : isLast ? '2px solid #10b981' : '2px solid #9ca3af' }} />
                          <Box flexGrow={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="h6" fontWeight={700} color="#ffffff" sx={{ fontSize: '1rem' }}>
                                {node.name}
                              </Typography>
                              <Chip
                                label={isFirst ? 'START USER' : isLast ? 'TARGET USER' : `STEP ${index}`}
                                size="small"
                                sx={{
                                  bgcolor: isFirst ? '#6366f1' : isLast ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: 10
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="#9ca3af">
                              {node.title}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Edge Relationship indicator */}
                    {!isLast && (
                      <Box display="flex" flexDirection="column" alignItems="center" py={0.5}>
                        <Chip
                          label={edge ? `[:KNOWS {since: ${edge.since || 2022}, type: "${edge.relationshipType || 'Peer'}"}]` : '[:KNOWS]'}
                          size="small"
                          sx={{ bgcolor: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', border: '1px solid rgba(244, 114, 182, 0.3)', fontFamily: 'monospace', fontSize: 11 }}
                        />
                        <ArrowDownwardIcon sx={{ color: '#f472b6', fontSize: 24, my: 0.5 }} />
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Stack>
          </Paper>
        )
      ) : null}
    </Container>
  );
}

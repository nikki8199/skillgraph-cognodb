import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../services/api';
import { LoadingSkeleton, EmptyState, ErrorBanner } from './StateHandler';

export default function NetworkExplorer({ activeUser, peopleList = [], onSelectPerson }) {
  const [selectedUser, setSelectedUser] = useState(activeUser || peopleList[0] || null);
  const [degreeFilter, setDegreeFilter] = useState('all'); // 'all', 1, 2, 3
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeUser) setSelectedUser(activeUser);
  }, [activeUser]);

  const fetchNetwork = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNetwork(selectedUser.id);
      setNetwork(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchNetwork();
    }
  }, [selectedUser]);

  const filteredNetwork = network.filter((item) => {
    if (degreeFilter === 'all') return true;
    return item.degree === Number(degreeFilter);
  });

  const getDegreeChip = (deg) => {
    if (deg === 1) return <Chip label="1st Degree Connection" size="small" sx={{ bgcolor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 600 }} />;
    if (deg === 2) return <Chip label="2nd Degree Connection" size="small" sx={{ bgcolor: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', fontWeight: 600 }} />;
    return <Chip label="3rd Degree Connection" size="small" sx={{ bgcolor: 'rgba(244, 114, 182, 0.2)', color: '#f472b6', fontWeight: 600 }} />;
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
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <HubIcon sx={{ color: '#818cf8', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Extended Network <span className="gradient-text">Explorer</span>
          </Typography>
        </Box>
        <Typography variant="body1" color="#9ca3af" sx={{ maxWidth: 750 }}>
          Traverse professional connections up to 3 degrees of separation to see how everyone in your graph ecosystem is interconnected.
        </Typography>
      </Paper>

      {/* Control Panel */}
      <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Select Root Professional"
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const u = peopleList.find((p) => p.id === e.target.value);
                if (u) setSelectedUser(u);
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

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" justifyContent={{ sm: 'flex-end' }} gap={1}>
              <Typography variant="body2" color="#9ca3af" mr={1}>
                Degree Depth:
              </Typography>
              <ToggleButtonGroup
                value={degreeFilter}
                exclusive
                onChange={(_, val) => val && setDegreeFilter(val)}
                size="small"
                sx={{
                  bgcolor: 'rgba(31, 41, 55, 0.6)',
                  '.MuiToggleButton-root': {
                    color: '#9ca3af',
                    borderColor: '#374151',
                    textTransform: 'none',
                    '&.Mui-selected': { color: '#ffffff', bgcolor: '#6366f1' }
                  }
                }}
              >
                <ToggleButton value="all">All Hops</ToggleButton>
                <ToggleButton value="1">1st Degree</ToggleButton>
                <ToggleButton value="2">2nd Degree</ToggleButton>
                <ToggleButton value="3">3rd Degree</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Network Cards Grid */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchNetwork} />
      ) : filteredNetwork.length === 0 ? (
        <EmptyState title="No network connections found at this degree depth" message="Try selecting a different degree filter or another root user." />
      ) : (
        <Grid container spacing={3}>
          {filteredNetwork.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card className="glass-card" sx={{ height: '100%', cursor: 'pointer' }} onClick={() => onSelectPerson(item.id)}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar src={item.avatarUrl} alt={item.name} sx={{ width: 52, height: 52, border: '2px solid #818cf8' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} color="#ffffff">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="#818cf8">
                          {item.title}
                        </Typography>
                      </Box>
                    </Box>
                    {getDegreeChip(item.degree)}
                  </Box>

                  {/* Path Chain */}
                  <Box p={1.5} sx={{ bgcolor: 'rgba(31, 41, 55, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Typography variant="caption" color="#9ca3af" fontWeight={600} display="block" mb={0.8}>
                      CONNECTION TRAVERSAL CHAIN:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                      {item.pathChain && item.pathChain.map((node, i) => (
                        <React.Fragment key={i}>
                          <Chip
                            label={node.name}
                            size="small"
                            sx={{
                              bgcolor: i === 0 ? 'rgba(99, 102, 241, 0.2)' : i === item.pathChain.length - 1 ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                              color: i === 0 ? '#818cf8' : i === item.pathChain.length - 1 ? '#a5b4fc' : '#d1d5db',
                              fontWeight: 600,
                              fontSize: 11
                            }}
                          />
                          {i < item.pathChain.length - 1 && (
                            <ArrowForwardIcon sx={{ color: '#6b7280', fontSize: 14 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

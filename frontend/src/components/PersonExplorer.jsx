import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import api from '../services/api';
import { LoadingSkeleton, EmptyState, ErrorBanner } from './StateHandler';

export default function PersonExplorer({ onSelectPerson, onFindMentors, onViewNetwork }) {
  const [people, setPeople] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  const fetchPeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPeople({
        search: search || undefined,
        skill: selectedSkill || undefined,
        company: selectedCompany || undefined
      });
      setPeople(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [search, selectedSkill, selectedCompany]);

  useEffect(() => {
    api.getSkills().then((res) => setSkillsList(res.data || [])).catch(() => {});
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Landing Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: 'Outfit, sans-serif' }}>
          Explore your <span className="gradient-text">professional network</span>
        </Typography>
        <Typography variant="body1" color="#9ca3af" sx={{ maxWidth: 700, mb: 3 }}>
          Discover skills, connection paths, and mentors through the graph relationships that unite your professional ecosystem.
        </Typography>

        {/* Summary Stat Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box p={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="h5" fontWeight={700} color="#818cf8">{people.length}</Typography>
              <Typography variant="caption" color="#9ca3af">Professionals Found</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box p={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="h5" fontWeight={700} color="#34d399">{skillsList.length}</Typography>
              <Typography variant="caption" color="#9ca3af">Graph Taxonomy Skills</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box p={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="h5" fontWeight={700} color="#f472b6">4</Typography>
              <Typography variant="caption" color="#9ca3af">Enterprise Companies</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box p={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="h5" fontWeight={700} color="#fbbf24">4</Typography>
              <Typography variant="caption" color="#9ca3af">Active Projects</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search & Filter Bar */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={4}>
        <TextField
          placeholder="Search professionals by name or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            )
          }}
          sx={{
            bgcolor: 'rgba(17, 24, 39, 0.7)',
            borderRadius: 2,
            input: { color: '#f3f4f6' },
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
          }}
        />

        <TextField
          select
          label="Filter by Skill"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          size="small"
          sx={{
            minWidth: 200,
            bgcolor: 'rgba(17, 24, 39, 0.7)',
            borderRadius: 2,
            select: { color: '#f3f4f6' },
            label: { color: '#9ca3af' },
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
          }}
        >
          <MenuItem value="">All Skills</MenuItem>
          {skillsList.map((s) => (
            <MenuItem key={s.id} value={s.name}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>

        {(search || selectedSkill || selectedCompany) && (
          <Button
            variant="text"
            onClick={() => {
              setSearch('');
              setSelectedSkill('');
              setSelectedCompany('');
            }}
            sx={{ color: '#9ca3af', textTransform: 'none' }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Main Grid Content */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchPeople} />
      ) : people.length === 0 ? (
        <EmptyState title="No professionals found" message="Try searching for another skill, name, or clear active filters." />
      ) : (
        <Grid container spacing={3}>
          {people.map((person) => (
            <Grid item xs={12} sm={6} md={4} key={person.id}>
              <Card
                className="glass-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(99, 102, 241, 0.5)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Avatar
                      src={person.avatarUrl}
                      alt={person.name}
                      sx={{ width: 56, height: 56, border: '2px solid #6366f1' }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="#f3f4f6" sx={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
                        {person.name}
                      </Typography>
                      <Typography variant="body2" color="#818cf8" fontWeight={500} mb={0.5}>
                        {person.title}
                      </Typography>
                      <Typography variant="caption" color="#9ca3af" display="flex" alignItems="center" gap={0.5}>
                        <WorkIcon sx={{ fontSize: 13 }} /> {person.experienceYears} Years Exp
                      </Typography>
                    </Box>
                  </Box>

                  {person.bio && (
                    <Typography variant="body2" color="#d1d5db" sx={{ fontSize: '0.85rem', mb: 2, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {person.bio}
                    </Typography>
                  )}
                </CardContent>

                <Box p={2} pt={0}>
                  <Grid container spacing={1} mb={2}>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<SchoolIcon fontSize="small" />}
                        onClick={() => onFindMentors(person)}
                        sx={{
                          color: '#34d399',
                          borderColor: 'rgba(52, 211, 153, 0.4)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: 12,
                          '&:hover': { bgcolor: 'rgba(52, 211, 153, 0.1)' }
                        }}
                      >
                        Find Mentor
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<HubIcon fontSize="small" />}
                        onClick={() => onViewNetwork(person)}
                        sx={{
                          color: '#818cf8',
                          borderColor: 'rgba(129, 140, 248, 0.4)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: 12,
                          '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.1)' }
                        }}
                      >
                        View Network
                      </Button>
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={() => onSelectPerson(person.id)}
                    sx={{
                      bgcolor: '#6366f1',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#4f46e5' }
                    }}
                  >
                    View Graph Profile
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

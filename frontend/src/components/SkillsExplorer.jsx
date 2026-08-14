import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  InputAdornment,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import api from '../services/api';
import { LoadingSkeleton, EmptyState, ErrorBanner } from './StateHandler';

export default function SkillsExplorer({ onSelectPerson, onFindMentors }) {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [peopleWithSkill, setPeopleWithSkill] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingSkills(true);
    api
      .getSkills({ search: search || undefined })
      .then((res) => {
        const list = res.data || [];
        setSkills(list);
        if (list.length > 0 && !selectedSkill) {
          setSelectedSkill(list[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSkills(false));
  }, [search]);

  useEffect(() => {
    if (selectedSkill) {
      setLoadingPeople(true);
      api
        .getPeopleBySkill(selectedSkill.id)
        .then((res) => setPeopleWithSkill(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingPeople(false));
    }
  }, [selectedSkill]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <PsychologyIcon sx={{ color: '#c084fc', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Graph Skill Taxonomy <span className="gradient-text">& Experts</span>
          </Typography>
        </Box>
        <Typography variant="body1" color="#9ca3af" sx={{ maxWidth: 750 }}>
          Explore technical skill nodes stored across the CognoDB graph and discover professionals who possess verified expertise.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column: Skills Taxonomy List */}
        <Grid item xs={12} md={4}>
          <Paper className="glass-card" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} color="#ffffff" mb={2}>
              Skill Nodes
            </Typography>

            <TextField
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                bgcolor: 'rgba(31, 41, 55, 0.6)',
                borderRadius: 2,
                mb: 2,
                input: { color: '#f3f4f6' },
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
              }}
            />

            {loadingSkills ? (
              <LoadingSkeleton count={4} height={60} />
            ) : (
              <Box display="flex" flexDirection="column" gap={1} sx={{ maxHeight: 500, overflowY: 'auto' }}>
                {skills.map((skill) => {
                  const isSelected = selectedSkill?.id === skill.id;
                  return (
                    <Box
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      p={2}
                      sx={{
                        bgcolor: isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(31, 41, 55, 0.4)',
                        border: isSelected ? '1px solid #c084fc' : '1px solid transparent',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.15)' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} color={isSelected ? '#c084fc' : '#ffffff'}>
                        {skill.name}
                      </Typography>
                      <Typography variant="caption" color="#9ca3af">
                        Category: {skill.category}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: People possessing selected skill */}
        <Grid item xs={12} md={8}>
          {selectedSkill && (
            <Box mb={3}>
              <Typography variant="h5" fontWeight={700} color="#ffffff">
                Experts with <span style={{ color: '#c084fc' }}>{selectedSkill.name}</span>
              </Typography>
              <Typography variant="body2" color="#9ca3af">
                Professionals with HAS_SKILL relationships connected to this node
              </Typography>
            </Box>
          )}

          {loadingPeople ? (
            <LoadingSkeleton count={3} />
          ) : peopleWithSkill.length === 0 ? (
            <EmptyState title="No professionals found with this skill" message="Select a different skill from the taxonomy list." />
          ) : (
            <Grid container spacing={2}>
              {peopleWithSkill.map((p) => (
                <Grid item xs={12} sm={6} key={p.id}>
                  <Card className="glass-card">
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar src={p.avatarUrl} alt={p.name} sx={{ width: 50, height: 50, border: '2px solid #c084fc' }} />
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="#ffffff" sx={{ fontSize: '1rem' }}>
                            {p.name}
                          </Typography>
                          <Typography variant="body2" color="#c084fc">
                            {p.title}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1} mb={2}>
                        <Chip label={`Level: ${p.level || 'Expert'}`} size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontWeight: 600 }} />
                        <Chip label={`${p.years || 5} Yrs Experience`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#d1d5db' }} />
                      </Box>

                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => onSelectPerson(p.id)}
                          sx={{ color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.4)', textTransform: 'none' }}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<SchoolIcon fontSize="small" />}
                          onClick={() => onFindMentors(p, selectedSkill?.id)}
                          sx={{ bgcolor: '#a855f7', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#9333ea' } }}
                        >
                          Find Mentor
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

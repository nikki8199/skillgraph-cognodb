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
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import BusinessIcon from '@mui/icons-material/Business';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../services/api';
import { LoadingSkeleton, EmptyState, ErrorBanner } from './StateHandler';

export default function MentorFinder({ activeUser, peopleList = [], initialSkill = '' }) {
  const [selectedUser, setSelectedUser] = useState(activeUser || peopleList[0] || null);
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(initialSkill || 's_react');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeUser) setSelectedUser(activeUser);
  }, [activeUser]);

  useEffect(() => {
    api.getSkills().then((res) => {
      const skills = res.data || [];
      setSkillsList(skills);
      if (!selectedSkill && skills.length > 0) {
        setSelectedSkill(skills[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSearchMentors = async () => {
    if (!selectedUser || !selectedSkill) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await api.getMentors(selectedUser.id, selectedSkill);
      setMentors(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser && selectedSkill) {
      handleSearchMentors();
    }
  }, [selectedUser, selectedSkill]);

  const getDegreeChip = (degree) => {
    if (degree === 1) {
      return <Chip label="1st Degree Connection" size="small" sx={{ bgcolor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #059669', fontWeight: 700 }} />;
    }
    if (degree === 2) {
      return <Chip label="2nd Degree Connection" size="small" sx={{ bgcolor: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', border: '1px solid #4f46e5', fontWeight: 700 }} />;
    }
    return <Chip label="3rd Degree Connection" size="small" sx={{ bgcolor: 'rgba(244, 114, 182, 0.2)', color: '#f472b6', border: '1px solid #db2777', fontWeight: 700 }} />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          borderRadius: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <SchoolIcon sx={{ color: '#34d399', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Multi-Hop <span className="gradient-text">Mentor Finder</span>
          </Typography>
        </Box>
        <Typography variant="body1" color="#9ca3af" sx={{ maxWidth: 750 }}>
          Leverage graph traversal to discover experts in your 1st, 2nd, and 3rd degree network who possess skills you want to learn.
        </Typography>
      </Paper>

      {/* Control Panel */}
      <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              select
              label="Requesting Professional (You)"
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

          <Grid item xs={12} sm={5}>
            <TextField
              select
              label="Skill You Want To Learn"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
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
              {skillsList.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSearchMentors}
              disabled={loading}
              sx={{
                bgcolor: '#10b981',
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              {loading ? 'Traversing...' : 'Find Mentors'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={handleSearchMentors} />
      ) : searched && mentors.length === 0 ? (
        <EmptyState title="No mentors found within your network for this skill" message="Try selecting a different skill or another starting professional in your network." />
      ) : (
        <Stack spacing={3}>
          {mentors.map((mentor, index) => (
            <Card key={index} className="glass-card" sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2} mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={mentor.avatarUrl} alt={mentor.mentorName} sx={{ width: 64, height: 64, border: '2px solid #10b981' }} />
                    <Box>
                      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Typography variant="h6" fontWeight={700} color="#ffffff">
                          {mentor.mentorName}
                        </Typography>
                        {getDegreeChip(mentor.degree)}
                      </Box>
                      <Typography variant="body2" color="#34d399" fontWeight={500}>
                        {mentor.mentorTitle}
                      </Typography>
                      <Typography variant="caption" color="#9ca3af">
                        Target Skill: <strong>{mentor.skillName}</strong> • {mentor.skillLevel || 'Expert'} ({mentor.skillYears || 5} Years Experience)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />

                {/* Graph Traversal Connection Path Chain */}
                <Box mb={2} p={2} sx={{ bgcolor: 'rgba(31, 41, 55, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Typography variant="caption" color="#9ca3af" fontWeight={600} display="block" mb={1}>
                    GRAPH CONNECTION PATH (TRAVERSAL CHAIN):
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    {mentor.connectionPath && mentor.connectionPath.map((node, i) => (
                      <React.Fragment key={i}>
                        <Chip
                          label={node.name}
                          size="small"
                          sx={{
                            bgcolor: i === 0 ? 'rgba(99, 102, 241, 0.2)' : i === mentor.connectionPath.length - 1 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: i === 0 ? '#818cf8' : i === mentor.connectionPath.length - 1 ? '#34d399' : '#d1d5db',
                            fontWeight: 600
                          }}
                        />
                        {i < mentor.connectionPath.length - 1 && (
                          <ArrowForwardIcon sx={{ color: '#6b7280', fontSize: 16 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>

                {/* Contextual Recommendation Explanations */}
                <Grid container spacing={2}>
                  {mentor.sharedCompanies && mentor.sharedCompanies.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon sx={{ color: '#818cf8', fontSize: 18 }} />
                        <Typography variant="caption" color="#9ca3af">
                          Shared Workplace History: <strong style={{ color: '#e5e7eb' }}>{mentor.sharedCompanies.join(', ')}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {mentor.sharedProjects && mentor.sharedProjects.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FolderSpecialIcon sx={{ color: '#f472b6', fontSize: 18 }} />
                        <Typography variant="caption" color="#9ca3af">
                          Shared Project History: <strong style={{ color: '#e5e7eb' }}>{mentor.sharedProjects.join(', ')}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

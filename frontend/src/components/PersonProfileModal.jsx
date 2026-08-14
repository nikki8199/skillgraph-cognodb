import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import BusinessIcon from '@mui/icons-material/Business';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../services/api';
import { ErrorBanner } from './StateHandler';

export default function PersonProfileModal({ personId, open, onClose, onFindMentors, onViewNetwork, onFindPath }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && personId) {
      setLoading(true);
      setError(null);
      api
        .getPerson(personId)
        .then((res) => setProfile(res.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [open, personId]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          color: '#f3f4f6',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 3,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Graph Profile Details
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#9ca3af' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        ) : error ? (
          <ErrorBanner message={error} />
        ) : profile ? (
          <Box>
            {/* Header info */}
            <Box display="flex" alignItems="center" gap={3} mb={3}>
              <Avatar src={profile.avatarUrl} alt={profile.name} sx={{ width: 72, height: 72, border: '3px solid #6366f1' }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="#ffffff">
                  {profile.name}
                </Typography>
                <Typography variant="subtitle1" color="#818cf8" fontWeight={500}>
                  {profile.title}
                </Typography>
                {profile.location && (
                  <Typography variant="caption" color="#9ca3af" display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    <LocationOnIcon sx={{ fontSize: 14 }} /> {profile.location.city}, {profile.location.country} • {profile.experienceYears} Yrs Exp
                  </Typography>
                )}
              </Box>
            </Box>

            {profile.bio && (
              <Box mb={3} p={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Typography variant="body2" color="#d1d5db">
                  {profile.bio}
                </Typography>
              </Box>
            )}

            {/* Quick Actions */}
            <Grid container spacing={2} mb={4}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  onClick={() => {
                    onClose();
                    onFindMentors(profile);
                  }}
                  sx={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)', borderRadius: 2, textTransform: 'none' }}
                >
                  Find Mentors
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HubIcon />}
                  onClick={() => {
                    onClose();
                    onViewNetwork(profile);
                  }}
                  sx={{ color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.4)', borderRadius: 2, textTransform: 'none' }}
                >
                  View Network
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AltRouteIcon />}
                  onClick={() => {
                    onClose();
                    onFindPath(profile);
                  }}
                  sx={{ color: '#f472b6', borderColor: 'rgba(244, 114, 182, 0.4)', borderRadius: 2, textTransform: 'none' }}
                >
                  Connection Path
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 3 }} />

            {/* Skills & Wants To Learn */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="#9ca3af" fontWeight={600} mb={1}>
                  PROVEN SKILLS (HAS_SKILL)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((s) => (
                      <Chip
                        key={s.id}
                        label={`${s.name} (${s.level || 'Expert'})`}
                        size="small"
                        sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="#6b7280">No skills recorded</Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="#9ca3af" fontWeight={600} mb={1}>
                  GOALS (WANTS_TO_LEARN)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {profile.wantsToLearn && profile.wantsToLearn.length > 0 ? (
                    profile.wantsToLearn.map((w) => (
                      <Chip
                        key={w.id}
                        label={`Target: ${w.name} (${w.priority || 'High'})`}
                        size="small"
                        sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#6ee7b7', border: '1px solid rgba(52, 211, 153, 0.3)' }}
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="#6b7280">No learning targets set</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Companies & Projects */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="#9ca3af" fontWeight={600} mb={1}>
                  COMPANIES (WORKED_AT)
                </Typography>
                {profile.companies && profile.companies.length > 0 ? (
                  profile.companies.map((c) => (
                    <Box key={c.id} display="flex" alignItems="center" gap={1} mb={1}>
                      <BusinessIcon sx={{ color: '#818cf8', fontSize: 18 }} />
                      <Typography variant="body2" color="#e5e7eb">
                        <strong>{c.name}</strong> — {c.role || 'Contributor'} ({c.startYear || '2021'} - {c.endYear || 'Present'})
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="#6b7280">No employment recorded</Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="#9ca3af" fontWeight={600} mb={1}>
                  PROJECTS (WORKED_ON)
                </Typography>
                {profile.projects && profile.projects.length > 0 ? (
                  profile.projects.map((p) => (
                    <Box key={p.id} display="flex" alignItems="center" gap={1} mb={1}>
                      <FolderSpecialIcon sx={{ color: '#f472b6', fontSize: 18 }} />
                      <Typography variant="body2" color="#e5e7eb">
                        <strong>{p.name}</strong> — {p.role || 'Contributor'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="#6b7280">No projects recorded</Typography>
                )}
              </Grid>
            </Grid>

            {/* Direct Connections */}
            <Box>
              <Typography variant="subtitle2" color="#9ca3af" fontWeight={600} mb={1}>
                DIRECT CONNECTIONS ({profile.connections?.length || 0})
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {profile.connections && profile.connections.length > 0 ? (
                  profile.connections.map((conn) => (
                    <Chip
                      key={conn.id}
                      avatar={<Avatar src={conn.avatarUrl} />}
                      label={`${conn.name} (${conn.relationshipType || 'Peer'})`}
                      size="small"
                      sx={{ bgcolor: 'rgba(31, 41, 55, 0.8)', color: '#f3f4f6', border: '1px solid #374151' }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="#6b7280">No direct connections found</Typography>
                )}
              </Box>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

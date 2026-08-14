import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HubIcon from '@mui/icons-material/Hub';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PsychologyIcon from '@mui/icons-material/Psychology';

const NAV_ITEMS = [
  { id: 'explore', label: 'Explore', icon: <PeopleIcon fontSize="small" /> },
  { id: 'mentors', label: 'Find Mentors', icon: <SchoolIcon fontSize="small" /> },
  { id: 'network', label: 'Network', icon: <HubIcon fontSize="small" /> },
  { id: 'path', label: 'Connection Path', icon: <AltRouteIcon fontSize="small" /> },
  { id: 'skills', label: 'Skills', icon: <PsychologyIcon fontSize="small" /> },
  { id: 'graph', label: 'Graph Visualizer', icon: <AccountTreeIcon fontSize="small" /> }
];

export default function Navbar({ activeTab, setActiveTab, selectedUser, setSelectedUser, peopleList = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Brand Logo */}
        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => setActiveTab('explore')}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
            }}
          >
            <HubIcon sx={{ color: '#ffffff', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif', letterSpacing: -0.5 }}>
            Skill<span className="gradient-text">Graph</span>
          </Typography>
          <Chip label="CognoDB" size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600, fontSize: 11 }} />
        </Box>

        {/* Desktop Nav Items */}
        <Box display={{ xs: 'none', md: 'flex' }} gap={1}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                startIcon={item.icon}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  color: isActive ? '#ffffff' : '#9ca3af',
                  bgcolor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  textTransform: 'none',
                  fontWeight: isActive ? 600 : 400,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff'
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Active User Context Switcher */}
        <Box display={{ xs: 'none', sm: 'flex' }} alignItems="center" gap={1}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel sx={{ color: '#9ca3af', fontSize: 12 }}>Active User</InputLabel>
            <Select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = peopleList.find((p) => p.id === e.target.value);
                if (user) setSelectedUser(user);
              }}
              label="Active User"
              sx={{
                color: '#f3f4f6',
                bgcolor: 'rgba(31, 41, 55, 0.6)',
                borderRadius: 2,
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                fontSize: 13
              }}
            >
              {peopleList.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Mobile Hamburger */}
        <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 250, bgcolor: '#0f172a', height: '100%', pt: 3, px: 2, color: '#f3f4f6' }}>
          <Typography variant="h6" fontWeight={700} mb={2} px={1}>
            SkillGraph Menu
          </Typography>
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeTab === item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <Box mr={1.5} color={activeTab === item.id ? '#818cf8' : '#9ca3af'}>
                    {item.icon}
                  </Box>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

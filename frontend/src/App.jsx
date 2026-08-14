import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar';
import PersonExplorer from './components/PersonExplorer';
import MentorFinder from './components/MentorFinder';
import NetworkExplorer from './components/NetworkExplorer';
import PathFinder from './components/PathFinder';
import SkillsExplorer from './components/SkillsExplorer';
import PersonProfileModal from './components/PersonProfileModal';
import api from './services/api';

// Lazy load GraphVisualizer to optimize bundle size and code-split force-graph dependency
const GraphVisualizer = lazy(() => import('./components/GraphVisualizer'));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0b0f19',
      paper: '#111827'
    },
    primary: {
      main: '#6366f1'
    },
    secondary: {
      main: '#10b981'
    }
  },
  typography: {
    fontFamily: '"Inter", sans-serif'
  }
});

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [peopleList, setPeopleList] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  // Mentor Finder pre-fill states
  const [mentorSkillPrefill, setMentorSkillPrefill] = useState('');

  useEffect(() => {
    api
      .getPeople()
      .then((res) => {
        const list = res.data || [];
        setPeopleList(list);
        if (list.length > 0 && !activeUser) {
          setActiveUser(list[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenProfile = (personId) => {
    setSelectedPersonId(personId);
    setProfileModalOpen(true);
  };

  const handleFindMentorsForPerson = (person, skillId = '') => {
    setActiveUser(person);
    setMentorSkillPrefill(skillId);
    setActiveTab('mentors');
  };

  const handleViewNetworkForPerson = (person) => {
    setActiveUser(person);
    setActiveTab('network');
  };

  const handleFindPathForPerson = (person) => {
    setActiveUser(person);
    setActiveTab('path');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0b0f19', pb: 6 }}>
        {/* Main Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedUser={activeUser}
          setSelectedUser={setActiveUser}
          peopleList={peopleList}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'explore' && (
          <PersonExplorer
            onSelectPerson={handleOpenProfile}
            onFindMentors={handleFindMentorsForPerson}
            onViewNetwork={handleViewNetworkForPerson}
          />
        )}

        {activeTab === 'mentors' && (
          <MentorFinder
            activeUser={activeUser}
            peopleList={peopleList}
            initialSkill={mentorSkillPrefill}
          />
        )}

        {activeTab === 'network' && (
          <NetworkExplorer
            activeUser={activeUser}
            peopleList={peopleList}
            onSelectPerson={handleOpenProfile}
          />
        )}

        {activeTab === 'path' && (
          <PathFinder peopleList={peopleList} />
        )}

        {activeTab === 'skills' && (
          <SkillsExplorer
            onSelectPerson={handleOpenProfile}
            onFindMentors={handleFindMentorsForPerson}
          />
        )}

        {activeTab === 'graph' && (
          <Suspense
            fallback={
              <Box display="flex" justifyContent="center" alignItems="center" py={12}>
                <CircularProgress sx={{ color: '#6366f1' }} />
              </Box>
            }
          >
            <GraphVisualizer />
          </Suspense>
        )}

        {/* Global Graph Profile Detail Modal */}
        <PersonProfileModal
          personId={selectedPersonId}
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onFindMentors={handleFindMentorsForPerson}
          onViewNetwork={handleViewNetworkForPerson}
          onFindPath={handleFindPathForPerson}
        />
      </Box>
    </ThemeProvider>
  );
}

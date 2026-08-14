import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.error?.message || error.message || 'Unable to connect to SkillGraph server.',
      status: error.response?.status || 500
    };
    return Promise.reject(customError);
  }
);

export const api = {
  getHealth: () => apiClient.get('/health'),
  getPeople: (params = {}) => apiClient.get('/people', { params }),
  getPerson: (personId) => apiClient.get(`/people/${personId}`),
  getSkills: (params = {}) => apiClient.get('/skills', { params }),
  getPeopleBySkill: (skillId) => apiClient.get(`/skills/${skillId}/people`),
  getConnections: (personId) => apiClient.get(`/people/${personId}/connections`),
  getMentors: (personId, skillId) => apiClient.get(`/people/${personId}/mentors/${skillId}`),
  getConnectionPath: (fromPersonId, toPersonId) => apiClient.get(`/people/${fromPersonId}/path/${toPersonId}`),
  getNetwork: (personId) => apiClient.get(`/people/${personId}/network`),
  getSharedSkills: (personId, otherPersonId) => apiClient.get(`/people/${personId}/shared-skills/${otherPersonId}`),
  getNetworkSkills: (personId) => apiClient.get(`/people/${personId}/network-skills`),
  getGraph: () => apiClient.get('/graph')
};

export default api;

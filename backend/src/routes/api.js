const express = require('express');
const router = express.Router();
const GraphController = require('../controllers/graphController');

// 1. Health verification
router.get('/health', GraphController.getHealth);

// 2. People listing & search
router.get('/people', GraphController.getPeople);

// 3. Person full profile details
router.get('/people/:personId', GraphController.getPersonDetails);

// 4. Skills listing & search
router.get('/skills', GraphController.getSkills);

// 5. People by Skill
router.get('/skills/:skillId/people', GraphController.getPeopleBySkill);

// 6. Direct KNOWS connections
router.get('/people/:personId/connections', GraphController.getDirectConnections);

// 7. Multi-Hop Mentor Recommendations (Q8)
router.get('/people/:personId/mentors/:skillId', GraphController.recommendMentors);

// 8. Shortest Connection Path
router.get('/people/:fromPersonId/path/:toPersonId', GraphController.getShortestPath);

// 9. Reachable Network (1-3 degrees)
router.get('/people/:personId/network', GraphController.getNetwork);

// 10. Shared Skills between two users
router.get('/people/:personId/shared-skills/:otherPersonId', GraphController.getSharedSkills);

// 11. Network Skill Trends
router.get('/people/:personId/network-skills', GraphController.getNetworkSkills);

// 12. Full Graph Layout Data (Visual graph engine)
router.get('/graph', GraphController.getGraphVisualization);

module.exports = router;

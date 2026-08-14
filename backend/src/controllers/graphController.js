const { GraphService } = require('../services/graphService');

/**
 * Controller Layer for SkillGraph REST API
 * Handles request validation, delegates business logic to GraphService, and formats HTTP responses.
 */
class GraphController {
  // 1. Health Verification
  static async getHealth(req, res, next) {
    try {
      const connCheck = await GraphService.verifyHealth();
      if (connCheck.success) {
        return res.status(200).json({
          success: true,
          database: 'connected'
        });
      } else {
        return res.status(503).json({
          success: false,
          error: {
            message: 'Database service unavailable. Failed to reach CognoDB instance.'
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // 2. People listing & search filtering
  static async getPeople(req, res, next) {
    try {
      const { search, skill, company, location } = req.query;
      const people = await GraphService.getPeople({ search, skill, company, location });
      return res.status(200).json({
        success: true,
        data: people
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Person Details Profile
  static async getPersonDetails(req, res, next) {
    try {
      const { personId } = req.params;
      const profile = await GraphService.getPersonDetails(personId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${personId}' was not found.`
          }
        });
      }
      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  // 4. Skills listing & search
  static async getSkills(req, res, next) {
    try {
      const { search } = req.query;
      const skills = await GraphService.getSkills({ search });
      return res.status(200).json({
        success: true,
        data: skills
      });
    } catch (error) {
      next(error);
    }
  }

  // 5. People by Skill
  static async getPeopleBySkill(req, res, next) {
    try {
      const { skillId } = req.params;
      const skillExists = await GraphService.checkSkillExists(skillId);
      if (!skillExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Skill with ID '${skillId}' was not found.`
          }
        });
      }
      const people = await GraphService.getPeopleBySkill(skillId);
      return res.status(200).json({
        success: true,
        data: people
      });
    } catch (error) {
      next(error);
    }
  }

  // 6. Direct Connections (1-hop KNOWS)
  static async getDirectConnections(req, res, next) {
    try {
      const { personId } = req.params;
      const personExists = await GraphService.checkPersonExists(personId);
      if (!personExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${personId}' was not found.`
          }
        });
      }
      const connections = await GraphService.getDirectConnections(personId);
      return res.status(200).json({
        success: true,
        data: connections
      });
    } catch (error) {
      next(error);
    }
  }

  // 7. Multi-Hop Mentor Recommendations (Q8)
  static async recommendMentors(req, res, next) {
    try {
      const { personId, skillId } = req.params;
      const personExists = await GraphService.checkPersonExists(personId);
      if (!personExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${personId}' was not found.`
          }
        });
      }
      const skillExists = await GraphService.checkSkillExists(skillId);
      if (!skillExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Skill with ID '${skillId}' was not found.`
          }
        });
      }

      const mentors = await GraphService.recommendMentors(personId, skillId);
      return res.status(200).json({
        success: true,
        data: mentors
      });
    } catch (error) {
      next(error);
    }
  }

  // 8. Shortest Connection Path
  static async getShortestPath(req, res, next) {
    try {
      const { fromPersonId, toPersonId } = req.params;
      if (fromPersonId === toPersonId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Source and target person IDs must be different.'
          }
        });
      }

      const fromExists = await GraphService.checkPersonExists(fromPersonId);
      if (!fromExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Source person with ID '${fromPersonId}' was not found.`
          }
        });
      }

      const toExists = await GraphService.checkPersonExists(toPersonId);
      if (!toExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Target person with ID '${toPersonId}' was not found.`
          }
        });
      }

      const result = await GraphService.getShortestPath(fromPersonId, toPersonId);
      if (!result || result.distance === null) {
        return res.status(200).json({
          success: true,
          data: {
            connected: false,
            distance: null,
            pathNodes: [],
            pathEdges: [],
            message: `No connection path exists between user '${fromPersonId}' and user '${toPersonId}'.`
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          connected: true,
          distance: result.distance,
          fromName: result.fromName,
          toName: result.toName,
          pathNodes: result.pathNodes,
          pathEdges: result.pathEdges
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 9. Reachable Network (1-3 KNOWS degrees)
  static async getNetwork(req, res, next) {
    try {
      const { personId } = req.params;
      const personExists = await GraphService.checkPersonExists(personId);
      if (!personExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${personId}' was not found.`
          }
        });
      }
      const network = await GraphService.getNetwork(personId);
      return res.status(200).json({
        success: true,
        data: network
      });
    } catch (error) {
      next(error);
    }
  }

  // 10. Shared Skills
  static async getSharedSkills(req, res, next) {
    try {
      const { personId, otherPersonId } = req.params;
      const p1Exists = await GraphService.checkPersonExists(personId);
      if (!p1Exists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${personId}' was not found.`
          }
        });
      }
      const p2Exists = await GraphService.checkPersonExists(otherPersonId);
      if (!p2Exists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${otherPersonId}' was not found.`
          }
        });
      }

      const shared = await GraphService.getSharedSkills(personId, otherPersonId);
      return res.status(200).json({
        success: true,
        data: shared
      });
    } catch (error) {
      next(error);
    }
  }

  // 11. Common Network Skills Analysis
  static async getNetworkSkills(req, res, next) {
    try {
      const { personId } = req.params;
      const personExists = await GraphService.checkPersonExists(personId);
      if (!personExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Person with ID '${personId}' was not found.`
          }
        });
      }
      const networkSkills = await GraphService.getNetworkSkills(personId);
      return res.status(200).json({
        success: true,
        data: networkSkills
      });
    } catch (error) {
      next(error);
    }
  }

  // 12. Full Graph Visualization Data
  static async getGraphVisualization(req, res, next) {
    try {
      const graphData = await GraphService.getFullVisualization();
      return res.status(200).json({
        success: true,
        data: graphData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GraphController;

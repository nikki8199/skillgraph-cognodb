const { driver, verifyConnectivity } = require('../config/db');
const queries = require('./cypherQueries');

/**
 * Utility to convert Neo4j/CognoDB driver primitives (Integer, Node, Relationship) into plain JS objects
 */
function toPlainObject(value) {
  if (value === null || value === undefined) {
    return value;
  }
  // Convert Neo4j Integer to native JS number
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  if (Array.isArray(value)) {
    return value.map(toPlainObject);
  }
  if (typeof value === 'object') {
    // Node object
    if (value.properties && typeof value.labels !== 'undefined') {
      return {
        _label: value.labels[0],
        ...toPlainObject(value.properties)
      };
    }
    // Relationship object
    if (value.properties && typeof value.type !== 'undefined') {
      return {
        _type: value.type,
        ...toPlainObject(value.properties)
      };
    }
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toPlainObject(val);
    }
    return result;
  }
  return value;
}

/**
 * Execute a parameterized Cypher query with strict session lifecycle handling
 */
async function executeQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => {
      const row = {};
      record.keys.forEach((key) => {
        row[key] = toPlainObject(record.get(key));
      });
      return row;
    });
  } catch (error) {
    console.error('❌ Database Query Error:', error.message);
    throw new Error(`Graph database query failed: ${error.message}`);
  } finally {
    await session.close();
  }
}

/**
 * Graph Service Layer
 * Abstracts Neo4j driver interactions, session management, and data formatting
 */
class GraphService {
  // 1. Health Verification
  static async verifyHealth() {
    return await verifyConnectivity();
  }

  // 2. People listing & search filtering
  static async getPeople({ search = null, skill = null, company = null, location = null } = {}) {
    return await executeQuery(queries.GET_PEOPLE_FILTERED, {
      search: search || null,
      skill: skill || null,
      company: company || null,
      location: location || null
    });
  }

  // 3. Person full profile
  static async getPersonDetails(personId) {
    const records = await executeQuery(queries.GET_PERSON_DETAILS, { personId });
    if (!records || records.length === 0 || !records[0].id) {
      return null;
    }
    const profile = records[0];
    // Filter out any null entries from empty graph aggregations
    profile.skills = (profile.skills || []).filter((s) => s && s.id);
    profile.wantsToLearn = (profile.wantsToLearn || []).filter((w) => w && w.id);
    profile.connections = (profile.connections || []).filter((c) => c && c.id);
    profile.companies = (profile.companies || []).filter((c) => c && c.id);
    profile.projects = (profile.projects || []).filter((p) => p && p.id);
    return profile;
  }

  static async checkPersonExists(personId) {
    const records = await executeQuery(queries.CHECK_PERSON_EXISTS, { personId });
    return records.length > 0;
  }

  // 4. Skills listing & search
  static async getSkills({ search = null } = {}) {
    return await executeQuery(queries.GET_ALL_SKILLS, { search: search || null });
  }

  static async checkSkillExists(skillId) {
    const records = await executeQuery(queries.CHECK_SKILL_EXISTS, { skillId });
    return records.length > 0;
  }

  // 5. People by Skill
  static async getPeopleBySkill(skillId) {
    return await executeQuery(queries.GET_PEOPLE_BY_SKILL, { skillId });
  }

  // 6. Direct Connections (1-hop KNOWS, bidirectional)
  static async getDirectConnections(personId) {
    return await executeQuery(queries.GET_DIRECT_CONNECTIONS, { personId });
  }

  // 7. Mentor Recommendations (Q8)
  static async recommendMentors(personId, skillId) {
    return await executeQuery(queries.RECOMMEND_MENTORS, { personId, skillId });
  }

  // 8. Shortest Connection Path
  static async getShortestPath(fromPersonId, toPersonId) {
    const records = await executeQuery(queries.GET_SHORTEST_PATH, { fromPersonId, toPersonId });
    if (!records || records.length === 0) {
      return null;
    }
    return records[0];
  }

  // 9. Reachable Network (1-3 degrees)
  static async getNetwork(personId) {
    return await executeQuery(queries.GET_NETWORK_DEGREES, { personId });
  }

  // 10. Shared Skills
  static async getSharedSkills(personId1, personId2) {
    return await executeQuery(queries.GET_SHARED_SKILLS, { personId1, personId2 });
  }

  // 11. Common Network Skills Analysis
  static async getNetworkSkills(personId) {
    return await executeQuery(queries.GET_NETWORK_SKILL_STATS, { personId });
  }

  // 12. Full Graph Visualization
  static async getFullVisualization() {
    const session = driver.session();
    try {
      const result = await session.run(queries.GET_FULL_GRAPH_VISUALIZATION);
      const nodesMap = new Map();
      const links = [];

      result.records.forEach((record) => {
        const n = record.get('n');
        const r = record.get('r');
        const m = record.get('m');

        if (n) {
          const plainN = toPlainObject(n);
          const nodeId = plainN.id || `${n.identity}`;
          if (!nodesMap.has(nodeId)) {
            nodesMap.set(nodeId, {
              id: nodeId,
              label: n.labels ? n.labels[0] : 'Node',
              properties: plainN
            });
          }
        }
        if (m) {
          const plainM = toPlainObject(m);
          const targetId = plainM.id || `${m.identity}`;
          if (!nodesMap.has(targetId)) {
            nodesMap.set(targetId, {
              id: targetId,
              label: m.labels ? m.labels[0] : 'Node',
              properties: plainM
            });
          }
        }
        if (r && n && m) {
          const sourceId = toPlainObject(n).id || `${n.identity}`;
          const targetId = toPlainObject(m).id || `${m.identity}`;
          links.push({
            id: `${r.identity}`,
            source: sourceId,
            target: targetId,
            type: r.type,
            properties: toPlainObject(r.properties)
          });
        }
      });

      return {
        nodes: Array.from(nodesMap.values()),
        links
      };
    } finally {
      await session.close();
    }
  }

  // Schema setup helper
  static async setupConstraints() {
    const session = driver.session();
    try {
      const constraintQueries = [
        queries.CREATE_PERSON_ID_CONSTRAINT,
        queries.CREATE_SKILL_ID_CONSTRAINT,
        queries.CREATE_COMPANY_ID_CONSTRAINT,
        queries.CREATE_LOCATION_ID_CONSTRAINT,
        queries.CREATE_PROJECT_ID_CONSTRAINT
      ];
      for (const q of constraintQueries) {
        try {
          await session.run(q);
        } catch (e) {
          // Ignore
        }
      }
      const indexQueries = [
        queries.CREATE_PERSON_ID_INDEX,
        queries.CREATE_SKILL_ID_INDEX,
        queries.CREATE_COMPANY_ID_INDEX,
        queries.CREATE_LOCATION_ID_INDEX,
        queries.CREATE_PROJECT_ID_INDEX
      ];
      for (const q of indexQueries) {
        try {
          await session.run(q);
        } catch (e) {
          // Ignore
        }
      }
      return { success: true };
    } finally {
      await session.close();
    }
  }

  static async getNodeCounts() {
    return await executeQuery(queries.COUNT_NODES_BY_LABEL);
  }

  static async getRelationshipCounts() {
    return await executeQuery(queries.COUNT_RELATIONSHIPS_BY_TYPE);
  }
}

module.exports = {
  GraphService,
  executeQuery,
  toPlainObject
};

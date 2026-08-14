/**
 * Parameterized openCypher Query Repository for SkillGraph / CognoDB
 * All queries strictly use parameters ($param) to prevent Cypher injection vulnerabilities.
 */

module.exports = {
  // --- SCHEMA CONSTRAINTS & INDEXES ---
  CREATE_PERSON_ID_CONSTRAINT: `
    CREATE CONSTRAINT person_id_unique IF NOT EXISTS
    FOR (p:Person) REQUIRE p.id IS UNIQUE
  `,
  CREATE_SKILL_ID_CONSTRAINT: `
    CREATE CONSTRAINT skill_id_unique IF NOT EXISTS
    FOR (s:Skill) REQUIRE s.id IS UNIQUE
  `,
  CREATE_COMPANY_ID_CONSTRAINT: `
    CREATE CONSTRAINT company_id_unique IF NOT EXISTS
    FOR (c:Company) REQUIRE c.id IS UNIQUE
  `,
  CREATE_LOCATION_ID_CONSTRAINT: `
    CREATE CONSTRAINT location_id_unique IF NOT EXISTS
    FOR (l:Location) REQUIRE l.id IS UNIQUE
  `,
  CREATE_PROJECT_ID_CONSTRAINT: `
    CREATE CONSTRAINT project_id_unique IF NOT EXISTS
    FOR (p:Project) REQUIRE p.id IS UNIQUE
  `,

  CREATE_PERSON_ID_INDEX: `CREATE INDEX person_id_idx IF NOT EXISTS FOR (p:Person) ON (p.id)`,
  CREATE_SKILL_ID_INDEX: `CREATE INDEX skill_id_idx IF NOT EXISTS FOR (s:Skill) ON (s.id)`,
  CREATE_COMPANY_ID_INDEX: `CREATE INDEX company_id_idx IF NOT EXISTS FOR (c:Company) ON (c.id)`,
  CREATE_LOCATION_ID_INDEX: `CREATE INDEX location_id_idx IF NOT EXISTS FOR (l:Location) ON (l.id)`,
  CREATE_PROJECT_ID_INDEX: `CREATE INDEX project_id_idx IF NOT EXISTS FOR (p:Project) ON (p.id)`,

  // --- DATABASE RESET / CLEAR ---
  CLEAR_ALL_DATA: `MATCH (n) DETACH DELETE n`,

  // --- SEEDING QUERIES (Idempotent MERGE) ---
  SEED_PERSON: `
    MERGE (p:Person {id: $id})
    SET p.name = $name,
        p.title = $title,
        p.email = $email,
        p.experienceYears = $experienceYears,
        p.bio = $bio,
        p.avatarUrl = $avatarUrl
    RETURN p
  `,
  SEED_SKILL: `
    MERGE (s:Skill {id: $id})
    SET s.name = $name,
        s.category = $category
    RETURN s
  `,
  SEED_COMPANY: `
    MERGE (c:Company {id: $id})
    SET c.name = $name,
        c.industry = $industry
    RETURN c
  `,
  SEED_LOCATION: `
    MERGE (l:Location {id: $id})
    SET l.city = $city,
        l.country = $country
    RETURN l
  `,
  SEED_PROJECT: `
    MERGE (p:Project {id: $id})
    SET p.name = $name,
        p.description = $description,
        p.category = $category
    RETURN p
  `,

  // --- SEEDING RELATIONSHIPS ---
  SEED_KNOWS_RELATIONSHIP: `
    MATCH (p1:Person {id: $personId1})
    MATCH (p2:Person {id: $personId2})
    MERGE (p1)-[r:KNOWS]->(p2)
    SET r.since = $since,
        r.relationshipType = $relationshipType
    RETURN r
  `,
  SEED_HAS_SKILL_RELATIONSHIP: `
    MATCH (p:Person {id: $personId})
    MATCH (s:Skill {id: $skillId})
    MERGE (p)-[r:HAS_SKILL]->(s)
    SET r.level = $level,
        r.years = $years
    RETURN r
  `,
  SEED_WANTS_TO_LEARN_RELATIONSHIP: `
    MATCH (p:Person {id: $personId})
    MATCH (s:Skill {id: $skillId})
    MERGE (p)-[r:WANTS_TO_LEARN]->(s)
    SET r.priority = $priority
    RETURN r
  `,
  SEED_WORKED_AT_RELATIONSHIP: `
    MATCH (p:Person {id: $personId})
    MATCH (c:Company {id: $companyId})
    MERGE (p)-[r:WORKED_AT]->(c)
    SET r.role = $role,
        r.startYear = $startYear,
        r.endYear = $endYear
    RETURN r
  `,
  SEED_LIVES_IN_RELATIONSHIP: `
    MATCH (p:Person {id: $personId})
    MATCH (l:Location {id: $locationId})
    MERGE (p)-[r:LIVES_IN]->(l)
    RETURN r
  `,
  SEED_WORKED_ON_RELATIONSHIP: `
    MATCH (p:Person {id: $personId})
    MATCH (proj:Project {id: $projectId})
    MERGE (p)-[r:WORKED_ON]->(proj)
    SET r.role = $role
    RETURN r
  `,

  // --- INSPECTION & STATS QUERIES ---
  COUNT_NODES_BY_LABEL: `
    MATCH (n)
    RETURN labels(n)[0] AS label, count(n) AS count
    ORDER BY count DESC
  `,
  COUNT_RELATIONSHIPS_BY_TYPE: `
    MATCH ()-[r]->()
    RETURN type(r) AS type, count(r) AS count
    ORDER BY count DESC
  `,

  // --- API QUERIES ---

  // 1. Get People with optional parameterized Cypher filters
  GET_PEOPLE_FILTERED: `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:LIVES_IN]->(loc:Location)
    OPTIONAL MATCH (p)-[:WORKED_AT]->(comp:Company)
    OPTIONAL MATCH (p)-[:HAS_SKILL]->(sk:Skill)
    WHERE ($search IS NULL OR toLower(p.name) CONTAINS toLower($search) OR toLower(p.title) CONTAINS toLower($search))
      AND ($skill IS NULL OR toLower(sk.name) CONTAINS toLower($skill) OR sk.id = $skill)
      AND ($company IS NULL OR toLower(comp.name) CONTAINS toLower($company) OR comp.id = $company)
      AND ($location IS NULL OR toLower(loc.city) CONTAINS toLower($location) OR toLower(loc.country) CONTAINS toLower($location) OR loc.id = $location)
    RETURN DISTINCT p.id AS id, p.name AS name, p.title AS title, p.email AS email, p.experienceYears AS experienceYears, p.bio AS bio, p.avatarUrl AS avatarUrl
    ORDER BY p.name ASC
  `,

  // 2. Person Full Details
  GET_PERSON_DETAILS: `
    MATCH (p:Person {id: $personId})
    OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(s:Skill)
    OPTIONAL MATCH (p)-[wl:WANTS_TO_LEARN]->(ws:Skill)
    OPTIONAL MATCH (p)-[k:KNOWS]-(conn:Person)
    OPTIONAL MATCH (p)-[wa:WORKED_AT]->(c:Company)
    OPTIONAL MATCH (p)-[wo:WORKED_ON]->(proj:Project)
    OPTIONAL MATCH (p)-[:LIVES_IN]->(l:Location)
    RETURN p.id AS id, p.name AS name, p.title AS title, p.email AS email, p.experienceYears AS experienceYears, p.bio AS bio, p.avatarUrl AS avatarUrl,
      collect(DISTINCT {id: s.id, name: s.name, category: s.category, level: hs.level, years: hs.years}) AS skills,
      collect(DISTINCT {id: ws.id, name: ws.name, category: ws.category, priority: wl.priority}) AS wantsToLearn,
      collect(DISTINCT {id: conn.id, name: conn.name, title: conn.title, avatarUrl: conn.avatarUrl, since: k.since, relationshipType: k.relationshipType}) AS connections,
      collect(DISTINCT {id: c.id, name: c.name, industry: c.industry, role: wa.role, startYear: wa.startYear, endYear: wa.endYear}) AS companies,
      collect(DISTINCT {id: proj.id, name: proj.name, category: proj.category, description: proj.description, role: wo.role}) AS projects,
      collect(DISTINCT {id: l.id, city: l.city, country: l.country})[0] AS location
  `,

  // Check if person exists
  CHECK_PERSON_EXISTS: `
    MATCH (p:Person {id: $personId})
    RETURN p.id AS id LIMIT 1
  `,

  // 3. Get Skills with optional search
  GET_ALL_SKILLS: `
    MATCH (s:Skill)
    WHERE $search IS NULL OR toLower(s.name) CONTAINS toLower($search) OR toLower(s.category) CONTAINS toLower($search)
    RETURN s.id AS id, s.name AS name, s.category AS category
    ORDER BY s.name ASC
  `,

  CHECK_SKILL_EXISTS: `
    MATCH (s:Skill {id: $skillId})
    RETURN s.id AS id, s.name AS name LIMIT 1
  `,

  // 4. People by Skill
  GET_PEOPLE_BY_SKILL: `
    MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)
    WHERE s.id = $skillId OR toLower(s.name) = toLower($skillId)
    RETURN p.id AS id, p.name AS name, p.title AS title, p.avatarUrl AS avatarUrl, r.level AS level, r.years AS years
    ORDER BY r.years DESC
  `,

  // 5. Direct connections (KNOWS traversed bidirectionally)
  GET_DIRECT_CONNECTIONS: `
    MATCH (p:Person {id: $personId})-[r:KNOWS]-(c:Person)
    RETURN c.id AS id, c.name AS name, c.title AS title, c.avatarUrl AS avatarUrl, r.since AS since, r.relationshipType AS relationshipType
    ORDER BY r.since ASC
  `,

  // 6. Multi-Hop Mentor Recommendation (Approved Q8 query)
  RECOMMEND_MENTORS: `
    MATCH (p:Person {id: $personId})
    MATCH (s:Skill) WHERE s.id = $skillId OR toLower(s.name) = toLower($skillId)
    MATCH knowsPath = (p)-[:KNOWS*1..3]-(mentor:Person)
    WHERE p <> mentor
    MATCH (mentor)-[h:HAS_SKILL]->(s)
    OPTIONAL MATCH (p)-[:WORKED_AT]->(c:Company)<-[:WORKED_AT]-(mentor)
    OPTIONAL MATCH (p)-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(mentor)
    WITH mentor, s, h, knowsPath, c, proj, length(knowsPath) AS degree
    RETURN 
      mentor.id AS mentorId,
      mentor.name AS mentorName,
      mentor.title AS mentorTitle,
      mentor.avatarUrl AS avatarUrl,
      s.name AS skillName,
      h.level AS skillLevel,
      h.years AS skillYears,
      degree,
      collect(DISTINCT c.name) AS sharedCompanies,
      collect(DISTINCT proj.name) AS sharedProjects,
      [n IN nodes(knowsPath) | {id: n.id, name: n.name}] AS connectionPath
    ORDER BY degree ASC, size(sharedCompanies) DESC, h.years DESC
  `,

  // 7. Shortest Path between two people
  GET_SHORTEST_PATH: `
    MATCH (p1:Person {id: $fromPersonId})
    MATCH (p2:Person {id: $toPersonId})
    OPTIONAL MATCH path = shortestPath((p1)-[:KNOWS*..5]-(p2))
    RETURN 
      p1.id AS fromId, p1.name AS fromName,
      p2.id AS toId, p2.name AS toName,
      CASE WHEN path IS NULL THEN null ELSE length(path) END AS distance,
      CASE WHEN path IS NULL THEN [] ELSE [n IN nodes(path) | {id: n.id, name: n.name, title: n.title, avatarUrl: n.avatarUrl}] END AS pathNodes,
      CASE WHEN path IS NULL THEN [] ELSE [r IN relationships(path) | {since: r.since, relationshipType: r.relationshipType}] END AS pathEdges
  `,

  // 8. Reachable Network (1-3 KNOWS degrees)
  GET_NETWORK_DEGREES: `
    MATCH (start:Person {id: $personId})
    MATCH path = (start)-[:KNOWS*1..3]-(connected:Person)
    WHERE start <> connected
    WITH connected, min(length(path)) AS degree, collect(path)[0] AS shortestPath
    RETURN 
      connected.id AS id, 
      connected.name AS name, 
      connected.title AS title,
      connected.avatarUrl AS avatarUrl,
      degree,
      [n IN nodes(shortestPath) WHERE n:Person | {id: n.id, name: n.name}] AS connectionPath
    ORDER BY degree ASC, connected.name ASC
  `,

  // 9. Shared Skills between two people
  GET_SHARED_SKILLS: `
    MATCH (p1:Person {id: $personId1})-[h1:HAS_SKILL]->(s:Skill)<-[h2:HAS_SKILL]-(p2:Person {id: $personId2})
    RETURN s.id AS id, s.name AS name, s.category AS category, h1.level AS person1Level, h1.years AS person1Years, h2.level AS person2Level, h2.years AS person2Years
    ORDER BY s.name ASC
  `,

  // 10. Common Network Skills Analysis
  GET_NETWORK_SKILL_STATS: `
    MATCH (p:Person {id: $personId})-[:KNOWS*1..2]-(contact:Person)-[h:HAS_SKILL]->(s:Skill)
    WHERE p <> contact
    WITH s, count(DISTINCT contact) AS totalPeople, collect(DISTINCT {id: contact.id, name: contact.name, title: contact.title, level: h.level}) AS people
    RETURN s.id AS id, s.name AS name, s.category AS category, totalPeople, people
    ORDER BY totalPeople DESC
    LIMIT 15
  `,

  // 11. Full Graph Visualization
  GET_FULL_GRAPH_VISUALIZATION: `
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, m
  `
};

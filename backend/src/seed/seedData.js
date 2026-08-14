const { driver, verifyConnectivity, closeDriver } = require('../config/db');
const queries = require('../services/cypherQueries');
const { GraphService } = require('../services/graphService');

// --- SEED DATASET ---

const LOCATIONS = [
  { id: 'loc_sf', city: 'San Francisco', country: 'USA' },
  { id: 'loc_london', city: 'London', country: 'UK' },
  { id: 'loc_bengaluru', city: 'Bengaluru', country: 'India' }
];

const COMPANIES = [
  { id: 'c_aether', name: 'Aether Cloud Solutions', industry: 'Cloud Infrastructure' },
  { id: 'c_nexus', name: 'Nexus Data Systems', industry: 'Enterprise Platforms' },
  { id: 'c_hyperion', name: 'Hyperion Dynamics', industry: 'Artificial Intelligence' },
  { id: 'c_vanguard', name: 'Vanguard Financial Tech', industry: 'Fintech & Payments' }
];

const SKILLS = [
  { id: 's_cypher', name: 'openCypher / Graph DB', category: 'Database & Data Eng' },
  { id: 's_react', name: 'React.js & Frontend Architecture', category: 'Frontend Web' },
  { id: 's_node', name: 'Node.js & Microservices', category: 'Backend Systems' },
  { id: 's_graphql', name: 'GraphQL API Design', category: 'API Infrastructure' },
  { id: 's_python_ai', name: 'Python & LLM Agent Frameworks', category: 'AI & Machine Learning' },
  { id: 's_system_design', name: 'Distributed System Design', category: 'Architecture' }
];

const PROJECTS = [
  { id: 'proj_graph_engine', name: 'Cognitive Graph Search Engine', description: 'High-throughput openCypher graph query and indexing service.', category: 'Data Systems' },
  { id: 'proj_ai_agent', name: 'Autonomous Enterprise AI Agent Platform', description: 'Multi-agent orchestration workflow platform using Python and LLMs.', category: 'Artificial Intelligence' },
  { id: 'proj_ui_system', name: 'Design System & Micro-Frontend Architecture', description: 'Component library and state synchronization framework built with React.', category: 'Frontend Systems' },
  { id: 'proj_payment_stream', name: 'Real-Time Payment Stream Processor', description: 'Distributed transaction processor handling high-volume fintech streams.', category: 'Fintech' }
];

const PEOPLE = [
  {
    id: 'p_alex',
    name: 'Alex Johnson',
    title: 'Principal Graph Architect',
    email: 'alex.johnson@aether.io',
    experienceYears: 9,
    bio: 'Specializes in graph database engine architecture, openCypher optimization, and knowledge graph systems.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'p_maria',
    name: 'Maria Garcia',
    title: 'Lead Frontend Engineer',
    email: 'maria.garcia@nexusdata.com',
    experienceYears: 7,
    bio: 'Passionate about modern React, interactive canvas visualization, and user experience design.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
  },
  {
    id: 'p_chen',
    name: 'David Chen',
    title: 'Senior AI Engineer',
    email: 'david.chen@hyperion.ai',
    experienceYears: 6,
    bio: 'Building LLM pipelines, graph neural networks, and multi-agent reasoning platforms.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'p_sarah',
    name: 'Sarah Jenkins',
    title: 'Staff Systems Architect',
    email: 'sarah.j@vanguardfin.com',
    experienceYears: 11,
    bio: 'Distributed systems veteran specializing in resilient event-driven microservices and high availability.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'p_rahul',
    name: 'Rahul Sharma',
    title: 'Fullstack Graph Engineer',
    email: 'rahul.s@aether.io',
    experienceYears: 5,
    bio: 'Bridging GraphQL, openCypher, and Node.js to power connected data applications.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'p_elena',
    name: 'Elena Rostova',
    title: 'AI Product Specialist',
    email: 'elena.r@hyperion.ai',
    experienceYears: 4,
    bio: 'Focused on AI developer tooling, prompt engineering workflows, and graph-assisted search.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'p_marcus',
    name: 'Marcus Vance',
    title: 'DevOps & Security Lead',
    email: 'marcus.v@nexusdata.com',
    experienceYears: 8,
    bio: 'Cloud security automation, Kubernetes orchestration, and zero-trust infrastructure.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'p_priyanka',
    name: 'Priyanka Patel',
    title: 'Senior Data Engineer',
    email: 'priyanka.p@vanguardfin.com',
    experienceYears: 6,
    bio: 'Big data pipelines, real-time analytics stream processing, and knowledge graph ETLs.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  }
];

// --- RELATIONSHIPS DATA ---

// 1. KNOWS (Social Graph with 1st, 2nd, 3rd degree paths)
// Alex <-> Maria (1st degree)
// Maria <-> Chen (2nd degree from Alex)
// Chen <-> Sarah (3rd degree from Alex)
const KNOWS_RELATIONSHIPS = [
  { personId1: 'p_alex', personId2: 'p_maria', since: 2021, relationshipType: 'Former Colleague' },
  { personId1: 'p_alex', personId2: 'p_rahul', since: 2022, relationshipType: 'Teammate' },
  { personId1: 'p_maria', personId2: 'p_chen', since: 2023, relationshipType: 'Open Source Collaborator' },
  { personId1: 'p_maria', personId2: 'p_marcus', since: 2020, relationshipType: 'Co-worker' },
  { personId1: 'p_chen', personId2: 'p_sarah', since: 2022, relationshipType: 'Conference Speaker Co-Host' },
  { personId1: 'p_chen', personId2: 'p_elena', since: 2024, relationshipType: 'Teammate' },
  { personId1: 'p_sarah', personId2: 'p_priyanka', since: 2021, relationshipType: 'Co-worker' },
  { personId1: 'p_rahul', personId2: 'p_priyanka', since: 2023, relationshipType: 'Hackathon Partner' },
  { personId1: 'p_alex', personId2: 'p_elena', since: 2023, relationshipType: 'Industry Peer' },
  { personId1: 'p_marcus', personId2: 'p_sarah', since: 2019, relationshipType: 'Former Teammate' }
];

// 2. HAS_SKILL (Proven Capabilities)
const HAS_SKILL_RELATIONSHIPS = [
  // Alex: Graph DB Expert, Node.js Expert, System Design Expert
  { personId: 'p_alex', skillId: 's_cypher', level: 'Expert', years: 8 },
  { personId: 'p_alex', skillId: 's_node', level: 'Expert', years: 7 },
  { personId: 'p_alex', skillId: 's_system_design', level: 'Expert', years: 9 },

  // Maria: React Expert, GraphQL Intermediate, Node.js Intermediate
  { personId: 'p_maria', skillId: 's_react', level: 'Expert', years: 7 },
  { personId: 'p_maria', skillId: 's_graphql', level: 'Intermediate', years: 4 },
  { personId: 'p_maria', skillId: 's_node', level: 'Intermediate', years: 5 },

  // Chen: Python AI Expert, System Design Expert, openCypher Intermediate
  { personId: 'p_chen', skillId: 's_python_ai', level: 'Expert', years: 6 },
  { personId: 'p_chen', skillId: 's_system_design', level: 'Expert', years: 6 },
  { personId: 'p_chen', skillId: 's_cypher', level: 'Intermediate', years: 3 },

  // Sarah: System Design Expert, Node.js Expert, openCypher Intermediate
  { personId: 'p_sarah', skillId: 's_system_design', level: 'Expert', years: 10 },
  { personId: 'p_sarah', skillId: 's_node', level: 'Expert', years: 8 },
  { personId: 'p_sarah', skillId: 's_cypher', level: 'Intermediate', years: 2 },

  // Rahul: Node.js Expert, GraphQL Expert, React Intermediate
  { personId: 'p_rahul', skillId: 's_node', level: 'Expert', years: 5 },
  { personId: 'p_rahul', skillId: 's_graphql', level: 'Expert', years: 4 },
  { personId: 'p_rahul', skillId: 's_react', level: 'Intermediate', years: 3 },

  // Elena: Python AI Expert, GraphQL Intermediate
  { personId: 'p_elena', skillId: 's_python_ai', level: 'Expert', years: 4 },
  { personId: 'p_elena', skillId: 's_graphql', level: 'Intermediate', years: 2 },

  // Marcus: System Design Expert
  { personId: 'p_marcus', skillId: 's_system_design', level: 'Expert', years: 8 },

  // Priyanka: System Design Expert, openCypher Intermediate, Python AI Intermediate
  { personId: 'p_priyanka', skillId: 's_system_design', level: 'Expert', years: 6 },
  { personId: 'p_priyanka', skillId: 's_cypher', level: 'Intermediate', years: 3 },
  { personId: 'p_priyanka', skillId: 's_python_ai', level: 'Intermediate', years: 4 }
];

// 3. WANTS_TO_LEARN (Learning Goals)
const WANTS_TO_LEARN_RELATIONSHIPS = [
  // Alex wants to learn React and Python AI
  { personId: 'p_alex', skillId: 's_react', priority: 'High' },
  { personId: 'p_alex', skillId: 's_python_ai', priority: 'Medium' },

  // Maria wants to learn openCypher and System Design
  { personId: 'p_maria', skillId: 's_cypher', priority: 'High' },
  { personId: 'p_maria', skillId: 's_system_design', priority: 'High' },

  // Chen wants to learn openCypher and GraphQL
  { personId: 'p_chen', skillId: 's_cypher', priority: 'High' },
  { personId: 'p_chen', skillId: 's_graphql', priority: 'Medium' },

  // Sarah wants to learn Python AI
  { personId: 'p_sarah', skillId: 's_python_ai', priority: 'High' },

  // Rahul wants to learn Python AI and System Design
  { personId: 'p_rahul', skillId: 's_python_ai', priority: 'High' },
  { personId: 'p_rahul', skillId: 's_system_design', priority: 'Medium' }
];

// 4. WORKED_AT (Employment History & Shared Context)
const WORKED_AT_RELATIONSHIPS = [
  { personId: 'p_alex', companyId: 'c_aether', role: 'Principal Graph Architect', startYear: 2022, endYear: null },
  { personId: 'p_alex', companyId: 'c_nexus', role: 'Senior Systems Engineer', startYear: 2018, endYear: 2022 },

  { personId: 'p_maria', companyId: 'c_nexus', role: 'Lead Frontend Engineer', startYear: 2020, endYear: null },
  { personId: 'p_maria', companyId: 'c_aether', role: 'Frontend Developer', startYear: 2017, endYear: 2020 },

  { personId: 'p_chen', companyId: 'c_hyperion', role: 'Senior AI Engineer', startYear: 2022, endYear: null },
  { personId: 'p_chen', companyId: 'c_nexus', role: 'AI Researcher', startYear: 2019, endYear: 2022 },

  { personId: 'p_sarah', companyId: 'c_vanguard', role: 'Staff Systems Architect', startYear: 2021, endYear: null },
  { personId: 'p_sarah', companyId: 'c_hyperion', role: 'Principal Engineer', startYear: 2017, endYear: 2021 },

  { personId: 'p_rahul', companyId: 'c_aether', role: 'Fullstack Graph Engineer', startYear: 2021, endYear: null },
  { personId: 'p_elena', companyId: 'c_hyperion', role: 'AI Product Specialist', startYear: 2023, endYear: null },
  { personId: 'p_marcus', companyId: 'c_nexus', role: 'DevOps & Security Lead', startYear: 2019, endYear: null },
  { personId: 'p_priyanka', companyId: 'c_vanguard', role: 'Senior Data Engineer', startYear: 2020, endYear: null }
];

// 5. LIVES_IN (Geographic Residence)
const LIVES_IN_RELATIONSHIPS = [
  { personId: 'p_alex', locationId: 'loc_sf' },
  { personId: 'p_maria', locationId: 'loc_sf' },
  { personId: 'p_chen', locationId: 'loc_sf' },
  { personId: 'p_sarah', locationId: 'loc_london' },
  { personId: 'p_rahul', locationId: 'loc_bengaluru' },
  { personId: 'p_elena', locationId: 'loc_sf' },
  { personId: 'p_marcus', locationId: 'loc_london' },
  { personId: 'p_priyanka', locationId: 'loc_bengaluru' }
];

// 6. WORKED_ON (Project History & Shared Context)
const WORKED_ON_RELATIONSHIPS = [
  { personId: 'p_alex', projectId: 'proj_graph_engine', role: 'Lead Architect' },
  { personId: 'p_rahul', projectId: 'proj_graph_engine', role: 'API Developer' },
  { personId: 'p_maria', projectId: 'proj_ui_system', role: 'UI Lead Architect' },
  { personId: 'p_chen', projectId: 'proj_ai_agent', role: 'Core AI Engineer' },
  { personId: 'p_elena', projectId: 'proj_ai_agent', role: 'Product Lead' },
  { personId: 'p_sarah', projectId: 'proj_payment_stream', role: 'System Architect' },
  { personId: 'p_priyanka', projectId: 'proj_payment_stream', role: 'Stream Data Engineer' }
];

/**
 * Main Seeding Script Execution
 */
async function seedDatabase() {
  console.log('----------------------------------------------------');
  console.log('🌱 Starting SkillGraph CognoDB Database Seeding...');
  console.log('----------------------------------------------------');

  const connectionCheck = await verifyConnectivity();
  if (!connectionCheck.success) {
    console.error('❌ Database Connection Failed:', connectionCheck.error);
    console.error('👉 Please check your .env configuration (COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD).');
    process.exit(1);
  }
  console.log(`✅ Database connection verified successfully at: ${connectionCheck.uri}`);

  const session = driver.session();
  try {
    // 1. Setup Constraints & Indexes
    console.log('\nStep 1: Setting up schema constraints & indexes...');
    await GraphService.setupConstraints();

    // 2. Clear existing database for clean idempotent setup
    console.log('\nStep 2: Clearing existing database graph data...');
    await session.run(queries.CLEAR_ALL_DATA);
    console.log('  └─ Existing graph cleared successfully.');

    // 3. Seed Nodes using MERGE
    console.log('\nStep 3: Seeding Entities (Nodes)...');

    for (const loc of LOCATIONS) {
      await session.run(queries.SEED_LOCATION, loc);
    }
    console.log(`  ├─ Created ${LOCATIONS.length} Location nodes.`);

    for (const comp of COMPANIES) {
      await session.run(queries.SEED_COMPANY, comp);
    }
    console.log(`  ├─ Created ${COMPANIES.length} Company nodes.`);

    for (const skill of SKILLS) {
      await session.run(queries.SEED_SKILL, skill);
    }
    console.log(`  ├─ Created ${SKILLS.length} Skill nodes.`);

    for (const proj of PROJECTS) {
      await session.run(queries.SEED_PROJECT, proj);
    }
    console.log(`  ├─ Created ${PROJECTS.length} Project nodes.`);

    for (const p of PEOPLE) {
      await session.run(queries.SEED_PERSON, p);
    }
    console.log(`  └─ Created ${PEOPLE.length} Person nodes.`);

    // 4. Seed Relationships
    console.log('\nStep 4: Seeding Graph Relationships...');

    for (const rel of KNOWS_RELATIONSHIPS) {
      await session.run(queries.SEED_KNOWS_RELATIONSHIP, rel);
    }
    console.log(`  ├─ Created ${KNOWS_RELATIONSHIPS.length} KNOWS relationships.`);

    for (const rel of HAS_SKILL_RELATIONSHIPS) {
      await session.run(queries.SEED_HAS_SKILL_RELATIONSHIP, rel);
    }
    console.log(`  ├─ Created ${HAS_SKILL_RELATIONSHIPS.length} HAS_SKILL relationships.`);

    for (const rel of WANTS_TO_LEARN_RELATIONSHIPS) {
      await session.run(queries.SEED_WANTS_TO_LEARN_RELATIONSHIP, rel);
    }
    console.log(`  ├─ Created ${WANTS_TO_LEARN_RELATIONSHIPS.length} WANTS_TO_LEARN relationships.`);

    for (const rel of WORKED_AT_RELATIONSHIPS) {
      await session.run(queries.SEED_WORKED_AT_RELATIONSHIP, rel);
    }
    console.log(`  ├─ Created ${WORKED_AT_RELATIONSHIPS.length} WORKED_AT relationships.`);

    for (const rel of LIVES_IN_RELATIONSHIPS) {
      await session.run(queries.SEED_LIVES_IN_RELATIONSHIP, rel);
    }
    console.log(`  ├─ Created ${LIVES_IN_RELATIONSHIPS.length} LIVES_IN relationships.`);

    for (const rel of WORKED_ON_RELATIONSHIPS) {
      await session.run(queries.SEED_WORKED_ON_RELATIONSHIP, rel);
    }
    console.log(`  └─ Created ${WORKED_ON_RELATIONSHIPS.length} WORKED_ON relationships.`);

    // 5. Verification & Summary Report
    console.log('\nStep 5: Running Graph Verification Checks...');
    const nodeCounts = await GraphService.getNodeCounts();
    const relCounts = await GraphService.getRelationshipCounts();

    console.log('\n📊 Node Summary by Label:');
    console.table(nodeCounts);

    console.log('\n🔗 Relationship Summary by Type:');
    console.table(relCounts);

    // 6. Execute Multi-Hop Verification Query
    console.log('\nStep 6: Executing Multi-Hop Test Query (Q8: Recommend React mentors for Alex Johnson)...');
    const mentorRecommendations = await GraphService.recommendMentors('p_alex', 's_react');
    console.log('✅ Multi-Hop Query Execution Result:');
    console.dir(mentorRecommendations, { depth: null });

    console.log('\n====================================================');
    console.log('🎉 SkillGraph Seed Script Completed Successfully!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  } finally {
    await session.close();
    await closeDriver();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

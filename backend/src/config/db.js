const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  console.warn('⚠️ Warning: COGNODB_URI, COGNODB_USERNAME, or COGNODB_PASSWORD environment variables are missing.');
}

const driver = neo4j.driver(
  uri || 'bolt://localhost:7687',
  neo4j.auth.basic(username || '', password || ''),
  {
    maxConnectionPoolSize: 50,
    connectionTimeout: 10000,
    disableLosslessIntegers: true
  }
);

/**
 * Verify connectivity to CognoDB instance
 */
async function verifyConnectivity() {
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS connected');
    const isConnected = result.records.length > 0 && result.records[0].get('connected') === 1;
    return { success: isConnected, uri: uri ? uri.replace(/\/\/.*@/, '//***@') : 'undefined' };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await session.close();
  }
}

/**
 * Close driver pool on application shutdown
 */
async function closeDriver() {
  await driver.close();
}

module.exports = {
  driver,
  verifyConnectivity,
  closeDriver
};
